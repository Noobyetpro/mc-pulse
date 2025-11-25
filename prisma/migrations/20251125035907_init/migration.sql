-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusSnapshot" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "online" BOOLEAN NOT NULL,
    "latencyMs" INTEGER,
    "playersOnline" INTEGER,
    "playersMax" INTEGER,
    "version" TEXT,
    "motd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Server_host_port_key" ON "Server"("host", "port");

-- AddForeignKey
ALTER TABLE "StatusSnapshot" ADD CONSTRAINT "StatusSnapshot_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
