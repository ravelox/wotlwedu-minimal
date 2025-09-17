{{- define "wotlwedu-minimal.labels" -}}
app.kubernetes.io/name: {{ include "wotlwedu-minimal.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- with .Chart.AppVersion }}
app.kubernetes.io/version: {{ . | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "wotlwedu-minimal.selectorLabels" -}}
app.kubernetes.io/name: {{ include "wotlwedu-minimal.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "wotlwedu-minimal.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "wotlwedu-minimal.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (include "wotlwedu-minimal.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
