CREATE TABLE IF NOT EXISTS /*_*/dota2webapicache (
  `matchid` bigint(20) NOT NULL,
  `apiresult` mediumblob,
  `timestamp` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE /*_*/dota2webapicache
 ADD UNIQUE KEY `matchid` (`matchid`);