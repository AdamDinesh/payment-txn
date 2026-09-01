CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE payments(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_ref VARCHAR(100) NOT NULL,
    idempotency_key VARCHAR(150) NOT NULL UNIQUE,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(20) NOT NULL DEFAULT 'INITIATED' CHECK (status IN ('INITIATED','PENDING','SUCCESS','FAILED')),
    provider_ref VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

CREATE TABLE idempotency_keys(
    idempotency_key VARCHAR(150) PRIMARY KEY,
     request_hash VARCHAR(64) NOT NULL,
     response_body JSONB,
     status_code INT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_history(
    id BIGSERIAL PRIMARY key,
    payment_id UUID NOT NULL REFERENCES payments(id),
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    source VARCHAR(20) NOT NULL CHECK (source IN ('API','WEBHOOK')),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_history_payment_id ON payment_history(payment_id);

CREATE TABLE payment_webhooks(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id),
    provider_ref VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT payment_webhooks_unique_event UNIQUE (payment_id,provider_ref,status)
);