## 🗺️ Diagrama de Entidades y Relaciones (Base de Datos)

```mermaid
erDiagram
  companies ||--o{ offices : "has"
  companies ||--o{ users : "has"
  offices ||--o{ employees : "has"
  users }o--o| user_offices : "assigned to"
  offices }o--o| user_offices : "has"
  employees ||--o{ movements : "registers"
  incidents ||--o{ movements : "has"

  companies {
    id string
    company_name string
    company_status int
    created_at datetime
    updated_at datetime
  }
  offices {
    id string
    company_id string
    office_name string
    office_status int
    created_at datetime
    updated_at datetime
  }
  employees {
    id string
    office_id string
    employee_code int
    employee_name string
    employee_type string
    employee_bonus_dom int
    employee_status int
    created_at datetime
    updated_at datetime
  }
  incidents {
    id string
    incident_code string
    incident_name string
    incident_status int
    created_at datetime
    updated_at datetime
  }
  movements {
    id string
    employee_code int
    incident_code string
    incidence_date datetime
    incidence_observation string
    incidence_status int
    created_at datetime
    updated_at datetime
  }
  users {
    id string
    company_id string
    user_name string
    user_email string
    user_password string
    user_status int
    user_rol int
    created_at datetime
    updated_at datetime
  }
  user_offices {
    id string
    user_id string
    office_id string
    created_at datetime
    updated_at datetime
  }
  periods {
    id string
    period_name string
    period_start datetime
    period_end datetime
    period_status int
    created_at datetime
    updated_at datetime
  }
```

---

<p align="center">
  <img src="../assets/logo-soaint-azul.png" alt="Logo del Proyecto">
</p>