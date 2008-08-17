CREATE TABLE cinema (
  id int(10) unsigned NOT NULL auto_increment,
  name varchar(255) default NULL,
  description mediumtext,
  info varchar(255) default NULL,
  PRIMARY KEY  (id)
);

CREATE TABLE movie (
  id int(10) unsigned NOT NULL auto_increment,
  name varchar(255) default NULL,
  description mediumtext,
  info varchar(255) default NULL,
  genre varchar(255) default NULL,
  rating varchar(255) default NULL,
  origin varchar(255) default NULL,
  PRIMARY KEY  (id)
);

CREATE TABLE movie_cinema (
  cinema_id int(10) unsigned NOT NULL,
  movie_id int(10) unsigned NOT NULL,
  shows mediumtext,
  KEY cinema_id (cinema_id),
  KEY movie_id (movie_id)
);
