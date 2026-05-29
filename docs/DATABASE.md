# Database ER Diagram

```mermaid
erDiagram
    User ||--o| CreditBalance : has
    User ||--o{ CreditTransaction : has
    User ||--o| Subscription : has
    User ||--o{ Project : owns
    User ||--o{ Generation : creates
    User ||--o{ AuditLog : generates
    User ||--o{ AnalyticsEvent : tracks
    User ||--o{ Account : links
    User ||--o{ Session : has

    Project ||--o{ Generation : contains
    Generation ||--o{ Generation : versions

    User {
        string id PK
        string email UK
        string passwordHash
        enum role
    }

    CreditBalance {
        string userId FK
        int balance
    }

    Subscription {
        string userId FK
        enum plan
        enum status
        string stripeCustomerId
    }

    Generation {
        string id PK
        string userId FK
        string projectId FK
        enum status
        enum style
        string originalKey
        string resultKey
        float qualityScore
    }
```

## Indexes

- `User.email`, `User.role`
- `Generation.userId + createdAt`
- `CreditTransaction.userId + createdAt`
- `Project.userId + name`

## Credit Model

| Action | Cost |
|--------|------|
| Standard transform | 1 credit |
| HD generation | 2 credits |
| Batch generation | 3 credits |
