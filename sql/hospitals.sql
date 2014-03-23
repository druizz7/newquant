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

 Date: 12/11/2013 09:22:08 AM
*/

-- ----------------------------
--  Table structure for hospitals
-- ----------------------------
DROP TABLE IF EXISTS "public"."hospitals";
CREATE TABLE "public"."hospitals" (
	"hospital_id" int4 NOT NULL DEFAULT nextval('hospital_id_seq'::regclass),
	"name" varchar NOT NULL COLLATE "default",
	"latitude" float4 NOT NULL,
	"longitude" float4 NOT NULL,
	"image" varchar COLLATE "default",
	"website" varchar COLLATE "default",
	"address" varchar COLLATE "default",
	"state" varchar COLLATE "default",
	"bucket" varchar COLLATE "default",
	"bpid" varchar COLLATE "default",
	"desk_id" varchar COLLATE "default"
)
WITH (OIDS=FALSE);
ALTER TABLE "public"."hospitals" OWNER TO "patrice";

-- ----------------------------
--  Records of hospitals
-- ----------------------------
BEGIN;
INSERT INTO "public"."hospitals" VALUES ('34', 'Saint Joseph Regional Medical Center', '40.9201', '-74.1664', null, 'http://stjosephshealth.org', '703 Main Street, Patterson', 'NJ', 'TNVG4p250Ace6Rs', null, '10581109');
INSERT INTO "public"."hospitals" VALUES ('16', 'Hunterdon Medical Center', '40.5314', '-74.8608', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.hunterdonhealthcare.org/', '2100 Wescott Drive, Flemington', 'NJ', 'u5r55K21wa6Z74j', null, '10580765');
INSERT INTO "public"."hospitals" VALUES ('33', 'Saint Michael''s Medical Center', '40.7428', '-74.1734', null, 'http://www.smmcnj.org', '111 Central Avenue, Newark', 'NJ', 'qLr495LsiMA63yP', null, '10581152');
INSERT INTO "public"."hospitals" VALUES ('28', 'Inspira Medical Center - Vineland', '39.4474', '-75.0584', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.sjhealthcare.net/SJH-regional-medical-center', '1505 West Sherman Avenue, Vineland', 'NJ', 'Y7gX3346cOFR81U', null, '10580969');
INSERT INTO "public"."hospitals" VALUES ('18', 'Morristown Medical Center', '40.7888', '-74.4662', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.atlantichealth.org/morristown/', '100 Madison Avenue, Morristown', 'NJ', 'Yp6F8kp79v7A65I', null, '10580939');
INSERT INTO "public"."hospitals" VALUES ('32', 'University Medical Center of Princeton at Plainsboro', '40.3398', '-74.624', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.princetonhcs.org/phcs-home/what-we-do/university-medical-center-of-princeton-at-plainsboro.aspx', '1 Plainsboro Road, Plainsboro', 'NJ', 'v81SZD47N731rO7', null, '10581090');
INSERT INTO "public"."hospitals" VALUES ('29', 'Inspira Medical Center - Woodbury', '39.844', '-75.1499', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.inspirahealthnetwork.org/', '509 North Broad Street, Woodbury', 'NJ', 'LL21GfYN782574L', null, '10581153');
INSERT INTO "public"."hospitals" VALUES ('27', 'Inspira Medical Center - Elmer', '39.5883', '-75.1794', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.inspirahealthnetwork.org/', '501 West Front Street, Elmer', 'NJ', 'z20x614SiMvbCds', null, '10581155');
INSERT INTO "public"."hospitals" VALUES ('31', 'The Valley Hospital', '40.9836', '-74.1005', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.valleyhealth.com/valley_hospital_default.aspx', '223 North Van Dien Avenue, Ridgewood', 'NJ', 'A6uDA1BaY3q1OBW', null, '10581154');
INSERT INTO "public"."hospitals" VALUES ('22', 'Robert Wood Johnson University Hospital -Rahway', '40.6129', '-74.2909', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.rwjuhr.com/', '865 Stone Street, Rahway', 'NJ', '8Ad6w3rkZI1S4Ts', null, '10581157');
INSERT INTO "public"."hospitals" VALUES ('19', 'Overlook Medical Center', '40.7126', '-74.3546', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.atlantichealth.org/overlook/', '99 Beauvoir Avenue, Summit', 'NJ', '81k879OwH8D88yN', null, '10581156');
INSERT INTO "public"."hospitals" VALUES ('35', 'Saint Mary''s Hospital Passaic', '40.8584', '-74.1374', null, 'http://www.smh-nj.org', '350 Boulevard, Passaic', 'NJ', '734KaF4vAJ1215K', null, '10581158');
INSERT INTO "public"."hospitals" VALUES ('20', 'Robert Wood Johnson University Hospital', '40.4959', '-74.4486', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.rwjuh.edu/', '1 Robert Wood Johnson Place, New Brunswick', 'NJ', '3dVI7F1486L48um', null, '10581159');
INSERT INTO "public"."hospitals" VALUES ('21', 'Robert Wood Johnson University Hospital -Hamilton', '40.2171', '-74.6747', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.rwjhamilton.org/', '1881 Whitehorse Hamilton Square Road, Hamilton', 'NJ', 'gOtk3JEP2ja72Rq', null, '10581160');
INSERT INTO "public"."hospitals" VALUES ('13', 'CentraState Medical Center', '40.2386', '-74.3129', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.centrastate.com/', '901 West Main Street, Freehold', 'NJ', '245B7kq6T535t6R', null, '10581163');
INSERT INTO "public"."hospitals" VALUES ('26', 'Saint Peter''s University Hospital', '40.5013', '-74.4592', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.saintpetershcs.com/', '254 Easton Avenue, New Brunswick', 'NJ', 'onE1667B16427ch', null, '10581161');
INSERT INTO "public"."hospitals" VALUES ('12', 'Capital Heath Medical Center - Hopewell', '40.2921', '-74.8033', 'http://media.nj.com/independentpress_impact/photo/10696945-large.jpg', 'http://www.capitalhealth.org/our-locations/hopewell', '1 Capital Way, Pennington', 'NJ', 'wD4dU3RzZ2D2D1V', null, '10581162');
INSERT INTO "public"."hospitals" VALUES ('24', 'Saint Clare''s Hospital (Denville, Dover)', '40.8954', '-74.4648', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.saintclares.org/saint-clares-hospital-denville-new-jersey', '25 Pocono Road, Denville', 'NJ', 'GAs73HsR4vRfZII', null, '10581164');
INSERT INTO "public"."hospitals" VALUES ('14', 'Cooper Hospital / University Medical Center', '39.9415', '-75.1168', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.cooperhealth.org/', '1 Cooper Plaza, Camden', 'NJ', 'mOU1K31e220X3Rj', null, '10581165');
INSERT INTO "public"."hospitals" VALUES ('15', 'Deborah Heart and Lung Center', '39.9775', '-74.5856', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.deborah.org/', '200 Trenton Road, Browns Mills', 'NJ', 'M238MULfq74I5Nh', '24', '10581166');
INSERT INTO "public"."hospitals" VALUES ('11', 'Capital Health Medical Center - Regional', '40.2363', '-74.7526', 'http://www.hunterdonhealthcare.org/hospitals/default/files/u6/HMC%201-18-2012%20(2).jpg', 'http://www.capitalhealth.org/', '750 Brunswick Avenue, Trenton', 'NJ', '2aFB9GBK2CO3H86', '3456', '10581167');
INSERT INTO "public"."hospitals" VALUES ('10', 'JFK Medical Center', '40.5578', '-74.3497', 'http://media.nj.com/ledgerlocal/photo/9018596-large.jpg', 'http://jfkmc.org/', '65 James Street, Edison', 'NJ', 'RHbogWvrg9FiGB4', null, '10581168');
INSERT INTO "public"."hospitals" VALUES ('17', 'Jersey Shore University Medical Center', '40.2074', '-74.0415', 'http://www.riverviewmedicalcenter.com/images/noFlash-RMC.jpg', 'http://www.jerseyshoreuniversitymedicalcenter.com/JSUMC/', '1945 Route 33, Neptune', 'NJ', 'dvOAgGgfCzkQGL1', null, '10581206');
COMMIT;

-- ----------------------------
--  Primary key structure for table hospitals
-- ----------------------------
ALTER TABLE "public"."hospitals" ADD CONSTRAINT "hospitals_pkey" PRIMARY KEY ("hospital_id") NOT DEFERRABLE INITIALLY IMMEDIATE;

