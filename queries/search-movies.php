<?

define('RAND_ID', 'get-cinema.php - ' . rand(1, 1000));
define('DEBUG', 0);

require_once('../comun/debug.php');
require_once('../comun/js.php');
require_once('../comun/db.php');
require_once('../comun/sql.php');

mysql_pconnect('localhost', 'root', '');
mysql_select_db('adondevamos');

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


$resultados = array();

$select = new SQL_Select('pelicula');

$select->addField('pelicula.id_pelicula');
$select->addField('pelicula.op_pelicula');
if (isset($_GET['getBriefInfo']) && $_GET['getBriefInfo']) {
    $select->addField('pelicula.origen');
    $select->addField('genero_cine.op_genero_cine');
    $select->addField('condicion.op_condicion');
    $select->addField('pelicula.comentario');
    $select->addLeftJoin('genero_cine', 'genero_cine.id_genero_cine=pelicula.id_genero_cine');
    $select->addLeftJoin('condicion', 'condicion.id_condicion=pelicula.id_condicion');
}
$select->addJoin('tl_cine_pelicula', 'tl_cine_pelicula.id_cine=cine.id_cine');
$select->addJoin('cine', 'tl_cine_pelicula.id_pelicula=pelicula.id_pelicula');
$select->addLimit(0, 10);
$select->addGroup('pelicula.id_pelicula');
$select->addOrder('pelicula.op_pelicula');
if (isset($_GET['id']) && $_GET['id']) {
    $select->addWhereFieldEquals('pelicula.id_pelicula', (int) $_GET['id']);
}

if (isset($_GET['new']) && $_GET['new']) {
    $select->addWhere('pelicula.fecha_estreno>=(DATE_SUB(NOW(), INTERVAL 6 DAY))');
}

foreach (DB_GetAllAssocOrEnd($select->get()) as $pelicula) {
    $resultado = array(
        'id' => $pelicula['id_pelicula'],
        'name' => $pelicula['op_pelicula'],
    );
    if (isset($_GET['getCinemas']) && $_GET['getCinemas']) {
        $resultado['cinemas'] = DB_GetAllAssocOrEnd('SELECT cine.id_cine AS id, cine.op_cine AS name, tl_cine_pelicula.horarios AS shows FROM cine, tl_cine_pelicula WHERE cine.id_cine=tl_cine_pelicula.id_cine && id_pelicula="' . (int) $pelicula['id_pelicula'] . '"');
    }
    if (isset($_GET['getBriefInfo']) && $_GET['getBriefInfo']) {
        $resultado['origin'] = $pelicula['origen'];
        $resultado['genre'] = $pelicula['op_genero_cine'];
        $resultado['condition'] = $pelicula['op_condicion'];
        $resultado['description'] = CutText(strip_tags($pelicula['comentario']), 200);
    }

    $resultados[] = $resultado;
}

header('Content-Type: text/plain; charset=iso-8859-1');

echo JS_GetObj($resultados);

?>