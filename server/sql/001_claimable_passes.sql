-- ==========================================================
-- Claimable Passes Migration (Food & Merch)
-- ==========================================================

-- 1. Table: event_staff
CREATE TABLE IF NOT EXISTS event_staff (
    iris_id TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('VOLUNTEER', 'ADMIN')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table: claimable_items
CREATE TABLE IF NOT EXISTS claimable_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    user_iris_id TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('FOOD', 'MERCH')),
    item_name TEXT NOT NULL,
    variant TEXT, -- e.g. 'M', 'XS', 'Black'
    item_index SMALLINT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'CLAIMED', 'VOID')),
    token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    claimed_at TIMESTAMPTZ,
    claimed_by TEXT REFERENCES event_staff(iris_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_claimable_items_payment ON claimable_items(payment_id);
CREATE INDEX IF NOT EXISTS idx_claimable_items_user ON claimable_items(user_iris_id);
CREATE INDEX IF NOT EXISTS idx_claimable_items_token ON claimable_items(token);

-- Enable and force Row Level Security (RLS)
ALTER TABLE event_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_staff FORCE ROW LEVEL SECURITY;

ALTER TABLE claimable_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE claimable_items FORCE ROW LEVEL SECURITY;

-- Revoke public/anon/authenticated access and grant all to service_role
REVOKE ALL ON TABLE event_staff FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE event_staff TO service_role;

REVOKE ALL ON TABLE claimable_items FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE claimable_items TO service_role;

-- 3. Atomic procedure: claim_event_pass
CREATE OR REPLACE FUNCTION claim_event_pass(p_token UUID, p_staff_iris_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_staff_active BOOLEAN;
    v_item RECORD;
    v_updated_item RECORD;
BEGIN
    -- Check if staff member exists and is active
    SELECT active INTO v_staff_active
    FROM event_staff
    WHERE iris_id = p_staff_iris_id;

    IF v_staff_active IS NULL OR v_staff_active = FALSE THEN
        RETURN jsonb_build_object(
            'result', 'FORBIDDEN',
            'message', 'Staff member is not active or unauthorized'
        );
    END IF;

    -- Fetch the claimable item by token
    SELECT * INTO v_item
    FROM claimable_items
    WHERE token = p_token;

    IF v_item.id IS NULL THEN
        RETURN jsonb_build_object(
            'result', 'INVALID',
            'message', 'Pass not found or invalid token'
        );
    END IF;

    -- Check status
    IF v_item.status = 'CLAIMED' THEN
        RETURN jsonb_build_object(
            'result', 'ALREADY_USED',
            'message', 'Pass has already been claimed',
            'claimed_at', v_item.claimed_at,
            'claimed_by', v_item.claimed_by,
            'item_name', v_item.item_name,
            'category', v_item.category,
            'variant', v_item.variant
        );
    END IF;

    IF v_item.status = 'VOID' THEN
        RETURN jsonb_build_object(
            'result', 'VOID',
            'message', 'Pass is void'
        );
    END IF;

    IF v_item.status <> 'ISSUED' THEN
        RETURN jsonb_build_object(
            'result', 'INVALID',
            'message', 'Pass cannot be claimed'
        );
    END IF;

    -- Atomically update claimable item
    UPDATE claimable_items
    SET status = 'CLAIMED',
        claimed_at = NOW(),
        claimed_by = p_staff_iris_id
    WHERE id = v_item.id AND status = 'ISSUED'
    RETURNING * INTO v_updated_item;

    -- If concurrent update modified status first
    IF v_updated_item.id IS NULL THEN
        SELECT * INTO v_item
        FROM claimable_items
        WHERE id = v_item.id;

        IF v_item.status = 'CLAIMED' THEN
            RETURN jsonb_build_object(
                'result', 'ALREADY_USED',
                'message', 'Pass has already been claimed',
                'claimed_at', v_item.claimed_at,
                'claimed_by', v_item.claimed_by,
                'item_name', v_item.item_name,
                'category', v_item.category,
                'variant', v_item.variant
            );
        ELSE
            RETURN jsonb_build_object(
                'result', 'INVALID',
                'message', 'Pass could not be claimed'
            );
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'result', 'OK',
        'item', jsonb_build_object(
            'id', v_updated_item.id,
            'payment_id', v_updated_item.payment_id,
            'user_iris_id', v_updated_item.user_iris_id,
            'category', v_updated_item.category,
            'item_name', v_updated_item.item_name,
            'variant', v_updated_item.variant,
            'item_index', v_updated_item.item_index,
            'status', v_updated_item.status,
            'token', v_updated_item.token,
            'claimed_at', v_updated_item.claimed_at,
            'claimed_by', v_updated_item.claimed_by,
            'created_at', v_updated_item.created_at
        )
    );
END;
$$;

REVOKE ALL ON FUNCTION claim_event_pass(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION claim_event_pass(UUID, TEXT) TO service_role;

-- 4. Seed: Bhoori Bhojana product into payment_products if not already present
INSERT INTO payment_products (id, name, category, unit_price, max_quantity, active)
VALUES ('bhoori-bhojana', 'Bhoori Bhojana Food Pass', 'FOOD', 150.00, 10, true)
ON CONFLICT (id) DO NOTHING;
