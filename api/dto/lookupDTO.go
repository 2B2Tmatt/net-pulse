package dto

import (
	"time"
)

type check string

type LookupRequest struct {
	Query  string       `json:"query"`
	Checks []CheckKind  `json:"checks,omitempty"`
	TCP    *TCPOptions  `json:"tcp,omitempty"`
	HTTP   *HTTPOptions `json:"http,omitempty"`
}

type CheckKind string

const (
	CheckDNS  CheckKind = "dns"
	CheckTCP  CheckKind = "tcp"
	CheckHTTP CheckKind = "http"
)

func (k CheckKind) IsValid() bool {
	switch k {
	case CheckDNS, CheckTCP, CheckHTTP:
		return true
	default:
		return false
	}
}

type TCPOptions struct {
	Port int `json:"port,omitempty"`
}

type HTTPOptions struct {
	Method          string `json:"method,omitempty"`
	FollowRedirects bool   `json:"follow_redirects,omitempty"`
	TimeoutMs       int    `json:"timeout_ms,omitempty"`
}

type LookupResponse struct {
	Query      string    `json:"query"`
	Normalized string    `json:"normalized"`
	Host       string    `json:"host"`
	Timestamp  time.Time `json:"timestamp"`
	Overall    Overall   `json:"overall"`

	DNS  DNSResult  `json:"dns"`
	TCP  TCPResult  `json:"tcp"`
	HTTP HTTPResult `json:"http"`
}

type Overall string

const (
	Up       Overall = "UP"
	Degraded Overall = "DEGRADED"
	Down     Overall = "DOWN"
)

type DNSResult struct {
	Attempted bool     `json:"skipped"`
	OK        bool     `json:"ok"`
	MS        int      `json:"ms"`
	A         []string `json:"a,omitempty"`
	AAAA      []string `json:"aaaa,omitempty"`
	Error     *ErrInfo `json:"error,omitempty"`
}

type TCPResult struct {
	Attempted bool     `json:"skipped"`
	OK        bool     `json:"ok"`
	MS        int      `json:"ms"`
	Port      int      `json:"port"`
	Error     *ErrInfo `json:"error,omitempty"`
}

type HTTPResult struct {
	Attempted bool     `json:"skipped"`
	OK        bool     `json:"ok"`
	MS        int      `json:"ms"`
	Status    int      `json:"status,omitempty"`
	FinalURL  string   `json:"final_url,omitempty"`
	Error     *ErrInfo `json:"error,omitempty"`
}

type ErrInfo struct {
	Type    ErrType `json:"type"`
	Message string  `json:"message"`
}

type ErrType string

type APIError struct {
	Error string `json:"error"`
}
