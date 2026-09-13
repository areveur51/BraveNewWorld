#!/usr/bin/env bash
# BraveNewWorld control — static CRT landing via python3 http.server
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
PUBLIC="${ROOT}/public"
PID_FILE="${ROOT}/bravenewworld.pid"
LOG_FILE="${ROOT}/bravenewworld.log"
DEFAULT_PORT=5230

usage() {
  cat <<USAGE
Usage: $(basename "$0") {start|stop|restart|status|logs|help}
USAGE
}

port_of() {
  echo "${BRAVENEWWORLD_PORT:-${PORT:-$DEFAULT_PORT}}"
}

is_running() {
  [[ -f "$PID_FILE" ]] || return 1
  local pid
  pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null
}

cmd_status() {
  local port
  port="$(port_of)"
  if is_running; then
    echo "bravenewworld RUNNING pid=$(cat "$PID_FILE") port=${port}"
  else
    echo "bravenewworld STOPPED"
  fi
  echo "Public: ${PUBLIC}"
}

cmd_stop() {
  if is_running; then
    local pid
    pid="$(cat "$PID_FILE")"
    kill "$pid" 2>/dev/null || true
    sleep 0.3
    if kill -0 "$pid" 2>/dev/null; then
      kill -TERM "$pid" 2>/dev/null || true
      sleep 0.4
    fi
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  fi
  rm -f "$PID_FILE"
  echo "Stopped"
}

cmd_start() {
  local port bind
  port="$(port_of)"
  bind="${BRAVENEWWORLD_BIND:-0.0.0.0}"
  if is_running; then
    echo "Already running pid=$(cat "$PID_FILE")"
    return 0
  fi
  if ss -ltn 2>/dev/null | grep -qE ":${port}\\b"; then
    echo "FAIL: port ${port} already in use" >&2
    return 1
  fi
  mkdir -p "$PUBLIC"
  : >>"$LOG_FILE"
  nohup python3 -m http.server "$port" --bind "$bind" --directory "$PUBLIC" \
    >>"$LOG_FILE" 2>&1 &
  echo $! >"$PID_FILE"
  sleep 0.4
  if ! is_running; then
    echo "Failed to start — last log lines:" >&2
    tail -n 30 "$LOG_FILE" >&2 || true
    rm -f "$PID_FILE"
    return 1
  fi
  echo "Started pid=$(cat "$PID_FILE") http://${bind}:${port}/"
}

cmd_restart() {
  cmd_stop
  cmd_start
}

cmd_logs() {
  tail -n "${1:-80}" "$LOG_FILE"
}

case "${1:-}" in
  start) cmd_start ;;
  stop) cmd_stop ;;
  restart) cmd_restart ;;
  status) cmd_status ;;
  logs) shift || true; cmd_logs "${1:-80}" ;;
  help|-h|--help) usage ;;
  *) usage; exit 1 ;;
esac
