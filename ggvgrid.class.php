<?php
require_once('validator.class.php');

class GGVGrid {
    const COLUMN_REQUIRED=0x01
        , COLUMN_EDITABLE=0x02
        , COLUMN_DISPLAY=0x04
        , COLUMN_NUMERIC=0x08;
    private $_aColumns = array();
    private $_aData = array();
    
    public function GGVGrid($aColumns) {
        foreach($aColumns as $sField => $aProperties){
            if ($aProperties['type']==Validator::STRING){
                $sFormat = Validator::getPattern($aProperties['type'],$aProperties['options']['min'],$aProperties['options']['max']);
            }
            elseif (($aProperties['type']==Validator::INT) || ($aProperties['type']==Validator::FLOAT)){
                $sFormat = Validator::getPattern($aProperties['type']);
            }
            else {
                $sFormat = $aProperties['options']['format'];
            }
            $sTip = array_key_exists('tip', $aProperties['options'])? $aProperties['options']['tip']:'';
            $nFlags = array_key_exists('flags', $aProperties['options'])? $aProperties['options']['flags']:0x00;
            $this->_aColumns[$sField] = array('type'    => $aProperties['type']
                                            , 'format'  => $sFormat
                                            , 'tip'     => $sTip
                                            , 'flags'   => $nFlags);
        }
    }
    
    public function setData($aData) {
        $this->_aData = $aData;
    }
    
    public function init($nTableRows, $nPage, $nRows){
        for($sTHeadRow = '<tr>';(list($sField,$Properties) = each($this->_aColumns));){
            $sTHeadRow .= '<th valid_format="'.$Properties['format'].'" tip_message="'.$Properties['tip'].'" flags="'.$Properties['flags'].'">'.$sField.'</th>';
        }
        $sTHeadRow .= '</tr>';
        
        for($sTBodyRows = '';(list($key,$aRowData) = each($this->_aData['data']));){
            $sTBodyRows .= '<tr id="'.$key.'"><td>'.implode('</td><td>',$aRowData).'</td></tr>';
        }
        
        if ((strcmp($nPage,'end')==0)||($nPage > ($nTableRows/$nRows))){
            $nPage = ((int)($nTableRows/$nRows))+1;
        }
        $sXML  = "<init>"
                    . "<parameters rows=\"$nRows\" page=\"$nPage\" />"
                    . "<title>{$this->_aData['title']}</title>"
                    . "<table>"
                        . "<thead>$sTHeadRow</thead>"
                        . "<tbody>$sTBodyRows</tbody>"
                    . "</table>"
                . "</init>";
         return $sXML;
    }
    
    public function validate($sField, $sData){
        return Validator::validate($this->_aColumns[$sField], $sData);
    }
}