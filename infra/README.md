# Infraestructura Frontend — QR-FLASK (Terraform + AWS EC2 + Nginx)

Despliega el frontend estático del sistema de asistencias QR en una instancia EC2 con Nginx y HTTPS mediante certificado autofirmado.

---

## 1. Qué despliega esta configuración

Terraform crea los siguientes recursos en AWS:

- VPC dedicada (`10.30.0.0/16`)
- Subred pública con IP pública automática
- Internet Gateway y tabla de rutas pública
- Security Group con puertos 80 (HTTP→HTTPS redirect), 443 (HTTPS) y 22 (SSH restringido)
- Instancia EC2 Amazon Linux 2023 (`t2.micro`)

Durante el arranque de la EC2 (`user_data`):

- Instala `nginx` y `openssl`
- Clona el repo `front-end-qr` en la rama definida
- Copia los archivos estáticos a `/usr/share/nginx/html/`
- Genera un certificado SSL autofirmado (válido 365 días)
- Inyecta la URL del backend en `js/config.js` (`window.API_BASE`)
- Configura Nginx: redirige HTTP→HTTPS y sirve la SPA con fallback a `index.html`

---

## 2. Estructura de archivos

```
infra/
├── providers.tf              # Versión de Terraform y proveedor AWS
├── variables.tf              # Variables de entrada
├── main.tf                   # VPC, subnet, security group, EC2
├── outputs.tf                # Salidas: IP, URL, comando SSH
├── user_data.sh.tftpl        # Bootstrap: Nginx, SSL, archivos estáticos
├── terraform.tfvars          # Valores reales (NO subir a git)
├── terraform.tfvars.example  # Plantilla de referencia
└── .gitignore                # Excluye .tfstate, .tfvars, .terraform/
```

---

## 3. Prerrequisitos

- Cuenta AWS activa con credenciales configuradas (`aws configure`)
- Terraform instalado
- Key Pair EC2 creado en AWS (puede ser el mismo del backend)
- Backend desplegado y con su IP pública disponible

Verifica credenciales antes de continuar:

```bash
aws sts get-caller-identity
```

---

## 4. Variables

Copia el ejemplo y edita con tus valores:

```bash
cp terraform.tfvars.example terraform.tfvars
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `project_name` | Prefijo de recursos AWS | `qr-frontend` |
| `aws_region` | Región AWS | `us-east-1` |
| `instance_type` | Tipo de instancia | `t2.micro` |
| `ssh_key_name` | Nombre del Key Pair en AWS | `test-qrflask` |
| `ssh_cidr` | Tu IP pública para SSH | `185.229.x.x/32` |
| `repo_url` | URL del repo frontend | `https://github.com/Arekkazu/front-end-qr.git` |
| `repo_branch` | Rama a desplegar | `deploy` |
| `api_base_url` | URL del backend desplegado | `https://<IP_BACKEND>` |

> Obtén tu IP pública con: `curl https://checkip.amazonaws.com`

---

## 5. Despliegue paso a paso

```bash
cd infra/

terraform init
terraform validate
terraform plan -out tfplan
terraform apply tfplan
```

Al finalizar verás:

```
frontend_url = "https://<IP_PUBLICA>"
public_ip    = "<IP_PUBLICA>"
ssh_command  = "ssh -i <key.pem> ec2-user@<IP_PUBLICA>"
```

> La EC2 tarda ~2 minutos en completar el `user_data`. Si la página no carga de inmediato, espera y recarga.

---

## 6. Acceso al frontend

Abre en el navegador:

```
https://<IP_PUBLICA>
```

El navegador mostrará una advertencia por el certificado autofirmado. Haz clic en **Avanzado → Acceder al sitio** para continuar.

> **Importante:** Para que el navegador permita llamadas al backend (también HTTPS con certificado autofirmado), debes aceptar también la excepción del backend abriendo `https://<IP_BACKEND>` en una pestaña separada.

---

## 7. Verificación en la instancia

```bash
ssh -i <ruta/key.pem> ec2-user@<IP_PUBLICA>

# Estado de Nginx
sudo systemctl status nginx

# Logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar archivos desplegados
ls /usr/share/nginx/html/
cat /usr/share/nginx/html/js/config.js

# Ver bootstrap completo
sudo cat /var/log/cloud-init-output.log
```

---

## 8. Actualizar el frontend sin recrear la instancia

Cuando hay cambios en el código (push a rama `deploy`):

```bash
ssh -i <key.pem> ec2-user@<IP_PUBLICA>

git config --global --add safe.directory /opt/front-end-qr
cd /opt/front-end-qr
sudo git pull origin deploy
sudo cp -r index.html js/ user/ admin/ /usr/share/nginx/html/
```

---

## 9. Recrear la instancia (despliegue limpio)

Si cambiaste `user_data` o variables de infraestructura:

```bash
terraform destroy -target=aws_instance.frontend
terraform apply
```

---

## 10. Destruir toda la infraestructura

```bash
terraform destroy
```

---

## 11. Problemas comunes

| Problema | Causa | Solución |
|---|---|---|
| SSH: Connection timed out | Tu IP cambió o no coincide con `ssh_cidr` | Actualiza `ssh_cidr` y corre `terraform apply` |
| Mixed Content en el navegador | Frontend HTTPS llama a backend HTTP | Configura HTTPS en el backend también |
| ERR_CERT_AUTHORITY_INVALID | Certificado autofirmado no aceptado | Abre `https://<IP_BACKEND>` y acepta la excepción |
| Página no carga tras deploy | `user_data` aún ejecutándose | Espera 2 min y recarga |
| `config.js` con URL incorrecta | `api_base_url` mal configurado | Edita `terraform.tfvars` y recrea la instancia |

---

## 12. Buenas prácticas

- Mantener `ssh_cidr` en `/32` con tu IP pública. Solo usar `0.0.0.0/0` temporalmente para diagnóstico.
- No subir `terraform.tfvars`, `*.tfstate` ni `.terraform/` al repositorio (ya están en `.gitignore`).
- El archivo `js/config.js` es generado en tiempo de despliegue por `user_data`. No lo commitees con valores de producción.
