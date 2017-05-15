SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE IF NOT EXISTS `dota2webapicache` (
  `matchid` bigint(20) NOT NULL,
  `apiresult` mediumblob,
  `timestamp` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `dota2webapicache`
 ADD UNIQUE KEY `matchid` (`matchid`);