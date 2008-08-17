<?

require_once('../start.php');
function CutText($text, $length)
{
    if (strlen($text) > $length) {
        $tinytemp = substr($text,0, $length);
        $lastword = strrpos($tinytemp, " ");
        return substr($tinytemp, 0, $lastword) . "...";
    } else {
        return $text;
    }
}
$results = array();
$sql = 'SELECT movie.id, movie.name';
if (!empty($_GET['getBriefInfo'])) {
    $sql .= ', origin, genre, rating, movie.description';
}
$sql .= ' FROM cinema JOIN movie JOIN movie_cinema ON (movie_cinema.cinema_id=cinema.id AND movie_cinema.movie_id=movie.id)';
if (!empty($_GET['id'])) {
    $sql .= ' WHERE movie.id=' . (int) $_GET['id'];
}
$sql .= ' GROUP BY movie.id ORDER BY movie.name LIMIT 10';
foreach (DB_GetAllAssocOrEnd($sql) as $result) {
    if (!empty($_GET['getCinemas'])) {
        $result['cinemas'] = DB_GetAllAssocOrEnd('SELECT cinema.id, cinema.name, movie_cinema.shows FROM cinema, movie_cinema WHERE cinema.id=movie_cinema.cinema_id && movie_id="' . (int) $result['id'] . '"');
    }
    if (!empty($result['description'])) {
        $result['description'] = CutText(strip_tags($result['description']), 200);
    }
    $results[] = $result;
}
header('Content-Type: text/javascript; charset=UTF-8');
echo json_encode($results);

?>