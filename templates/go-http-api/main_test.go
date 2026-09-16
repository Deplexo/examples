package main

import (
	"encoding/json"
	"net/http/httptest"
	"testing"
)

func TestHTTP(t *testing.T) {
	for _, tc := range []struct {
		name, path string
		status     int
	}{{"health", "/healthz", 200}, {"greeting", "/greet?name=Alex", 200}, {"missing name", "/greet", 400}, {"unknown", "/missing", 404}} {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			handler().ServeHTTP(w, httptest.NewRequest("GET", tc.path, nil))
			if w.Code != tc.status {
				t.Fatalf("status=%d want %d", w.Code, tc.status)
			}
			if tc.status == 200 {
				var body map[string]string
				if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
					t.Fatal(err)
				}
			}
		})
	}
}
