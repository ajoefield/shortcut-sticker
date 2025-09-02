-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apps" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "iconColor" TEXT NOT NULL DEFAULT '#64748b',

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shortcuts" (
    "id" TEXT NOT NULL,
    "keys" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'mac',
    "appId" TEXT NOT NULL,

    CONSTRAINT "shortcuts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layouts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layout_shortcuts" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "layoutId" TEXT NOT NULL,
    "shortcutId" TEXT NOT NULL,

    CONSTRAINT "layout_shortcuts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "apps_name_key" ON "apps"("name");

-- CreateIndex
CREATE UNIQUE INDEX "layout_shortcuts_layoutId_position_key" ON "layout_shortcuts"("layoutId", "position");

-- AddForeignKey
ALTER TABLE "shortcuts" ADD CONSTRAINT "shortcuts_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layouts" ADD CONSTRAINT "layouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_shortcuts" ADD CONSTRAINT "layout_shortcuts_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "layouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_shortcuts" ADD CONSTRAINT "layout_shortcuts_shortcutId_fkey" FOREIGN KEY ("shortcutId") REFERENCES "shortcuts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
