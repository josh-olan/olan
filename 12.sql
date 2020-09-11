SELECT title FROM movies
WHERE id IN (SELECT t1.movie_id FROM
            (SELECT movie_id FROM stars WHERE person_id = (SELECT id FROM people WHERE name = "Johnny Depp")) t1
            JOIN
            (SELECT movie_id FROM stars WHERE person_id = (SELECT id FROM people WHERE name = "Helena Bonham Carter")) t2
            ON t1.movie_id = t2.movie_id
            WHERE t1.movie_id = t2.movie_id);