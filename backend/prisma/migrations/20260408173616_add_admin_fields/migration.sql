-- CreateTable
CREATE TABLE "artifacts" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "data" BYTEA NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_artifacts" (
    "log_id" INTEGER NOT NULL,
    "artifact_id" INTEGER NOT NULL,

    CONSTRAINT "log_artifacts_pkey" PRIMARY KEY ("log_id","artifact_id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER,
    "user_id" INTEGER,
    "timestamp" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "author" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "mission" TEXT NOT NULL,
    "charter" TEXT NOT NULL,
    "machine_name" VARCHAR(255),
    "status" VARCHAR(50) DEFAULT 'planned',
    "start_time" TIMESTAMP(6),
    "end_time" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "duration_minutes" INTEGER DEFAULT 60,
    "debrief_summary" TEXT,
    "software_version" VARCHAR(255),
    "user_id" INTEGER,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_artifacts_session_id" ON "artifacts"("session_id");

-- CreateIndex
CREATE INDEX "idx_log_artifacts_artifact_id" ON "log_artifacts"("artifact_id");

-- CreateIndex
CREATE INDEX "idx_log_artifacts_log_id" ON "log_artifacts"("log_id");

-- CreateIndex
CREATE INDEX "idx_logs_session_id" ON "logs"("session_id");

-- CreateIndex
CREATE INDEX "idx_logs_user_id" ON "logs"("user_id");

-- CreateIndex
CREATE INDEX "idx_sessions_user_id" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "log_artifacts" ADD CONSTRAINT "log_artifacts_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "artifacts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "log_artifacts" ADD CONSTRAINT "log_artifacts_log_id_fkey" FOREIGN KEY ("log_id") REFERENCES "logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
