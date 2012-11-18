<?php
include 'ini.php';
include 'postgres.class.php';

$oPostgres = new postgres();
$oPostgres->connect();



require_once('ggvgrid.class.php');

$oGGVGrid = new GGVGrid (array('id'       =>  array('type' => Validator::INT, 'options' => array('flags' => GGVGrid::COLUMN_REQUIRED|GGVGrid::COLUMN_DISPLAY|GGVGrid::COLUMN_NUMERIC
                                                                                         , 'tip' => 'integer value is required')) 
                        ,'title'    =>  array('type' => Validator::STRING, 'options' => array('flags' => GGVGrid::COLUMN_DISPLAY|GGVGrid::COLUMN_EDITABLE
                                                                                            , 'min' => 1, 'max' => 100, 'tip' => 'string between 1 and 100 characters expected'))
                        ,'artist'   =>  array('type' => Validator::STRING, 'options' => array('flags' => GGVGrid::COLUMN_DISPLAY|GGVGrid::COLUMN_EDITABLE
                                                                                            , 'min' => 1, 'max' => 100, 'tip' => 'string between 1 and 100 characters expected'))));

 switch($_POST['query']){
    case 'init':
        $nRows = $_POST['rows'];
        
        $nOffset = (strcmp($_POST['page'], 'end')==0) ? 'end':($nRows*($_POST['page']-1));
        $sSelectQuery = 'select "id", "title", "artist", rowcount.rows' 
                    . ' from "album", ( select (count(*)) as rows,'
                    . "                           (count(*)/$nRows) as pages"
                    . '                           from "album") rowcount'
                    . " offset (select case "
                    . ((strcmp($nOffset, 'end')==0) ? '':" when ((count(*)-$nOffset) > $nRows) then $nOffset")
                    .         " when ((count(*)-$nRows) > 0) then (count(*)-$nRows)"
                    .         " else 0"
                    .         ' end'
                    .         ' from "album")'
                    . " limit $nRows";
        
        
//        echo $sSelectQuery;
        $aResult = $oPostgres->query($sSelectQuery);
        for ($aTableData = array();list(,$aRow)=each($aResult);$aTableData[$aRow['id']] = array($aRow['id'],$aRow['title'],$aRow['artist']));
        $nTableRows = $aResult[0]['rows'];
        $oGGVGrid->setData(array('title' => 'Albums'
                             ,'data' => $aTableData));
        echo $oGGVGrid->init($nTableRows,$_POST['page'],$_POST['rows']);
    break;
    case 'update':
        for($sSetQuery='';list($sColumn,$sValue)=each($_POST['data']);$sSetQuery .= " \"$sColumn\"='$sValue',");
        $sSetQuery[strlen($sSetQuery)-1]=' ';
        $sUpdateQuery = 'update "album" set '.$sSetQuery.' where "id"=\''.$_POST['data_id'].'\'';
        $oPostgres->query($sUpdateQuery);
        if(is_null($oPostgres->getLastError())){
            echo "<update><tr id=\"{$_POST['data']['id']}\"><td>".implode("</td><td>",$_POST['data'])."</td></tr></update>";
        }
        else {
            echo $oPostgres->getLastError(PGSQL_DIAG_MESSAGE_DETAIL);
        }
    break;
    case 'save':
        $sInsertQuery = 'insert into "album" ("'.implode('","',  array_keys($_POST['data'])).'") values (\''.implode("','",$_POST['data']).'\')';
        $oPostgres->query($sInsertQuery);
        if(is_null($oPostgres->getLastError())){
            echo "<add><tr id=\"{$_POST['data']['id']}\"><td>".implode("</td><td>",$_POST['data'])."</td></tr></add>";
        }
    break;
    case 'delete':
        $sInsertQuery = 'delete from "album" where "id" in (\''.implode("','",$_POST['data']).'\')';
        
        $oPostgres->query($sInsertQuery);
        if(is_null($oPostgres->getLastError())){
            echo '<removed items="'.implode(',',$_POST['data']).'"/>';
        }
    break;
}
