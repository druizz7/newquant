/*
 Navicat Premium Data Transfer

 Source Server         : Postgres 9.2 5432
 Source Server Type    : PostgreSQL
 Source Server Version : 90300
 Source Host           : localhost
 Source Database       : bcare
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 90300
 File Encoding         : utf-8

 Date: 12/11/2013 09:22:00 AM
*/

-- ----------------------------
--  Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "public"."users";
CREATE TABLE "public"."users" (
	"user_id" int4 NOT NULL DEFAULT nextval('user_id_seq'::regclass),
	"singly_id" varchar(32) NOT NULL COLLATE "default",
	"first_name" varchar(64) NOT NULL COLLATE "default",
	"last_name" varchar(64) NOT NULL COLLATE "default",
	"displayname" varchar(64) NOT NULL COLLATE "default",
	"email" varchar(80) COLLATE "default",
	"gravatar" varchar(128) COLLATE "default",
	"is_admin" bool NOT NULL,
	"is_banned" bool NOT NULL,
	"hospital_id" int4,
	"phone" varchar COLLATE "default",
	"desk_id" varchar COLLATE "default"
)
WITH (OIDS=FALSE);
ALTER TABLE "public"."users" OWNER TO "patrice";

