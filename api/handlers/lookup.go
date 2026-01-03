package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"pulse-api/dto"
	"strconv"
	"strings"
	"time"
)

func Lookup(w http.ResponseWriter, r *http.Request) {
	data, err := io.ReadAll(r.Body)
	if err != nil {
		writeJsonError(w, http.StatusBadRequest, "issue reading request body")
		return
	}
	var reqBody dto.LookupRequest
	err = json.Unmarshal(data, &reqBody)
	if err != nil {
		log.Println(err)
		writeJsonError(w, http.StatusBadRequest, "request body is in an unreadable form")
		return
	}
	fmt.Println(reqBody)

	for _, kind := range reqBody.Checks {
		if !kind.IsValid() {
			writeJsonError(w, http.StatusBadRequest, fmt.Sprintf("invalid check: %q", kind))
			return
		}
	}
	fullURL, host, err := normalizeURL(reqBody.Query)
	log.Printf("fullURL: %s  host: %s", fullURL, host)
	if err != nil {
		writeJsonError(w, http.StatusBadRequest, fmt.Sprintf("invalid url: %s", err))
		return
	}

	var respBody dto.LookupResponse
	opt := make(map[dto.CheckKind]struct{}, 0)
	ctx := context.Background()
	for i, kind := range reqBody.Checks {
		if i > 2 {
			break
		}
		_, alreadyTested := opt[kind]
		if alreadyTested {
			continue
		}
		switch kind {
		case dto.CheckDNS:
			dnsCtx, dnsCancel := context.WithTimeout(ctx, 2*time.Second)
			defer dnsCancel()
			dnsResult := runDNS(dnsCtx, host)
			respBody.DNS = dnsResult
		case dto.CheckHTTP:
			httpCtx, httpCancel := context.WithTimeout(ctx, 5*time.Second)
			defer httpCancel()
			httpResult := runHTTP(httpCtx, fullURL, reqBody.HTTP)
			respBody.HTTP = httpResult
		case dto.CheckTCP:
			tcpCtx, tcpCancel := context.WithTimeout(ctx, 3*time.Second)
			defer tcpCancel()
			tcpResult := runTCP(tcpCtx, host, reqBody.TCP)
			respBody.TCP = tcpResult
		}
		opt[kind] = struct{}{}
	}
	respBody.Query = reqBody.Query
	respBody.Normalized = fullURL
	respBody.Host = host
	if respBody.HTTP.Error != nil {
		respBody.Overall = dto.Down
	} else {
		respBody.Overall = dto.Up
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(respBody)
	if err != nil {
		writeJsonError(w, http.StatusInternalServerError, "error encoding response body")
		return
	}
}

func writeJsonError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(dto.APIError{Error: msg})
}

func runDNS(ctx context.Context, query string) dto.DNSResult {
	var dnsResult dto.DNSResult
	ip := net.ParseIP(query)
	if ip != nil {
		log.Println("is already an ip")
		dnsResult.Error = &dto.ErrInfo{
			Type:    "Bad Request",
			Message: "dns lookup not possible on ip",
		}
		return dnsResult
	}
	dnsResult.Attempted = true
	start := time.Now()
	ips, err := net.DefaultResolver.LookupHost(ctx, query)
	if err != nil {
		log.Println(err)
		dnsResult.MS = -1
		dnsResult.Error = &dto.ErrInfo{
			Type:    "Bad Request",
			Message: "unable to look up dns",
		}
		return dnsResult
	}
	elapsed := time.Since(start)
	dnsResult.OK = true
	dnsResult.MS = int(elapsed.Milliseconds())
	for _, ipStr := range ips {
		ip := net.ParseIP(ipStr)
		if ip == nil {
			log.Println("invalid ip")
		} else if ip.To4() != nil {
			dnsResult.A = append(dnsResult.A, ipStr)
		} else {
			dnsResult.AAAA = append(dnsResult.AAAA, ipStr)
		}
	}
	return dnsResult
}

func runHTTP(ctx context.Context, query string, opt *dto.HTTPOptions) dto.HTTPResult {
	var httpResult dto.HTTPResult
	if !validateHTTPMethod(opt.Method) || opt.Method == "" {
		httpResult.Error = &dto.ErrInfo{
			Type:    "Bad Request",
			Message: "invalid or missing http method",
		}
		return httpResult
	}
	httpResult.Attempted = true
	reqCtx, reqCancel := context.WithTimeout(ctx, time.Millisecond*time.Duration(opt.TimeoutMs))
	defer reqCancel()
	client := http.Client{}
	if !opt.FollowRedirects {
		ModifyClient(&client, NoRedirects())
	}
	req, err := http.NewRequestWithContext(reqCtx, opt.Method, query, nil)
	if err != nil {
		httpResult.Error = &dto.ErrInfo{
			Type:    "Internal Server Error",
			Message: "could not create request",
		}
		log.Println(err)
		return httpResult
	}
	start := time.Now()
	resp, err := client.Do(req)
	if err != nil {
		httpResult.Error = &dto.ErrInfo{
			Type:    "Internal Server Error",
			Message: "request failed",
		}
		log.Println(err)
		return httpResult
	}
	elapsed := time.Since(start)
	defer resp.Body.Close()
	httpResult.OK = true
	httpResult.MS = int(elapsed.Milliseconds())
	httpResult.Status = resp.StatusCode
	httpResult.FinalURL = resp.Request.URL.String()
	return httpResult
}

type Option func(*http.Client)

func NoRedirects() Option {
	return func(c *http.Client) {
		c.CheckRedirect = func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		}
	}
}

func ModifyClient(c *http.Client, opt Option) {
	opt(c)
}

func validateHTTPMethod(method string) bool {
	switch method {
	case http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodDelete, http.MethodPut:
		return true
	default:
		return false
	}
}

func runTCP(ctx context.Context, query string, opt *dto.TCPOptions) dto.TCPResult {
	port := strconv.Itoa(opt.Port)
	tcpResult := dto.TCPResult{
		Attempted: true,
	}
	address := net.JoinHostPort(query, port)
	start := time.Now()
	d := net.Dialer{}
	conn, err := d.DialContext(ctx, "tcp", address)
	if err != nil {
		tcpResult.Error = &dto.ErrInfo{
			Type:    "Bad Request",
			Message: "tcp connection failed",
		}
		log.Println(err)
		return tcpResult
	}
	elapsed := time.Since(start)
	defer conn.Close()
	tcpResult.Port = opt.Port
	tcpResult.MS = int(elapsed.Milliseconds())
	tcpResult.OK = true

	return tcpResult
}

func normalizeURL(rawURL string) (string, string, error) {
	if !strings.Contains(rawURL, "://") {
		rawURL = "https://" + rawURL
	}

	u, err := url.Parse(rawURL)
	if err != nil {
		return "", "", err
	}

	if u.Host == "" {
		return "", "", errors.New("missing host")
	}

	u.Host = strings.ToLower(u.Host)
	u.Path = strings.TrimRight(u.Path, "/")

	return u.String(), u.Host, nil
}
