<?

require_once('../start.php');
if (!isset($_GET['id'])) {
    die('Missing required parameter');
}
header('Content-Type: text/javascript; charset=UTF-8');
echo json_encode(
    DB_GetOneAssocOrEnd(
        'SELECT name, description, info, "películas" AS linkName FROM cinema WHERE id=' . (int) $_GET['id']
    )
);

?>