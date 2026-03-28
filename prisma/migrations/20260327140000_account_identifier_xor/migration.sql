ALTER TABLE "accounts"
ALTER COLUMN "phone_number" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

ALTER TABLE "accounts"
ADD CONSTRAINT "accounts_identifier_xor_check"
CHECK (
	(
		"email" IS NOT NULL
		AND "phone_number" IS NULL
	)
	OR (
		"email" IS NULL
		AND "phone_number" IS NOT NULL
	)
);
