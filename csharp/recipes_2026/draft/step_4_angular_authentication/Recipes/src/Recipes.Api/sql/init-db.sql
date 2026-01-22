IF DB_ID('Recipes') IS NULL
BEGIN
    CREATE DATABASE Recipes;
END
GO

USE Recipes;
GO

-- Admin login/user for migrations
IF EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = 'recipes_admin')
BEGIN
    DROP USER recipes_admin;
    DROP LOGIN recipes_admin;
END
GO

CREATE LOGIN recipes_admin WITH PASSWORD = 'StrongP4ssword123';
GO

CREATE USER recipes_admin FOR LOGIN recipes_admin;
GO

ALTER ROLE db_owner ADD MEMBER recipes_admin;
GO

-- App login/user for the running API
IF EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = 'recipes_app')
BEGIN
    DROP USER recipes_app;
    DROP LOGIN recipes_app;
END
GO

CREATE LOGIN recipes_app WITH PASSWORD = 'StrongP4ssword123';
GO

CREATE USER recipes_app FOR LOGIN recipes_app;
GO

ALTER ROLE db_datareader ADD MEMBER recipes_app;
ALTER ROLE db_datawriter ADD MEMBER recipes_app;
GO
