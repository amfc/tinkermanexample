<?

require_once('../start.php');
$results = array();
$conditions = array();
if (isset($_GET['q'])) {
    foreach (preg_split('/\s+/m', trim(utf8_encode($_GET['q']))) as $word) {
        $escaped_word = DB_EscapeLike($word);
        $conditions[] = '(cinema.name LIKE "%' . $escaped_word . '%" || movie.name LIKE "%' . $escaped_word . '%" || cinema.info LIKE "%' . $escaped_word .'%" || movie_cinema.shows LIKE "%' . $escaped_word . '%")';
    }
}
if (isset($_GET['id'])) {
    $conditions[] = 'cinema.id=' . (int) $_GET['id'];
}
$sql = 'SELECT cinema.id, cinema.name, cinema.info FROM cinema JOIN movie JOIN movie_cinema ON (movie_cinema.cinema_id=cinema.id AND movie_cinema.movie_id=movie.id)';
if ($conditions) {
    $sql .= ' WHERE ' . implode(' AND ', $conditions);
}
$sql .= ' GROUP BY cinema.id ORDER BY cinema.name LIMIT 4';
foreach (DB_GetAllAssocOrEnd($sql) as $cinema) {
    $result = array(
        'id' => $cinema['id'],
        'name' => $cinema['name'],
        'address' => $cinema['info'],
        'movies' => DB_GetAllAssocOrEnd('SELECT movie.id, movie.name, movie_cinema.shows FROM movie, movie_cinema WHERE movie.id=movie_cinema.movie_id && cinema_id="' . (int) $cinema['id'] . '"')
    );
    $results[] = $result;
}
header('Content-Type: text/javascript; charset=UTF-8');
echo json_encode($results);

?>