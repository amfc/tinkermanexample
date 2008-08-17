<?

define('RAND_ID', 'get-cinema.php - ' . rand(1, 1000));
define('DEBUG', 0);

require_once('../includes/debug.php');
require_once('../includes/js.php');
require_once('../includes/db.php');
require_once('../includes/sql.php');

mysql_pconnect('localhost', 'root', '');
mysql_select_db('adondevamos');

if (!isset($_GET['id'])) {
    EndWithError('Missing required parameter');
} else {
    $id = (int) $_GET['id'];
}

$resultados = array();

$select = new SQL_Select('pelicula');

$select->addField('pelicula.op_pelicula AS name');
$select->addField('pelicula.comentario AS description');
$select->addField('pelicula.ft_foto1 AS photo1');
$select->addField('pelicula.ft_foto2 AS photo2');
$select->addField('pelicula.ft_foto3 AS photo3');
$select->addField('"" AS info');
$select->addWhereFieldEquals('id_pelicula', $id);

$result = DB_GetOneAssocOrEnd($select->get());

header('Content-Type: text/plain; charset=iso-8859-1');

echo JS_GetObj($result);

?>