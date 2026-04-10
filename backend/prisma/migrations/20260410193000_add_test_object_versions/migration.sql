-- CreateTable
CREATE TABLE "test_object_versions" (
    "id" SERIAL NOT NULL,
    "version" VARCHAR(255) NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_object_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "test_object_versions_version_key" ON "test_object_versions"("version");

-- CreateIndex
CREATE INDEX "idx_test_object_versions_created_at" ON "test_object_versions"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_test_object_versions_created_by" ON "test_object_versions"("created_by");

-- AddForeignKey
ALTER TABLE "test_object_versions" ADD CONSTRAINT "test_object_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
