<?php
class Validator {
    const STRING=0;
    const INT=1;
    const FLOAT=2;
    
    static public function getPattern($nPatternType, $nMin=NULL, $nMax=NULL){
        switch($nPatternType){
            case self::STRING:
                return self::_getStringPattern($nMin, $nMax);
            break;
            case self::FLOAT:
                return self::_getFloatPattern();
            break;
            case self::INT:
                return self::_getIntegerPattern();
            break;
            default:
                return $nPatternType;
            break;
        }
    }
    
    static public function validate($sPattern, $sData){
        return preg_match_all($sPattern, $sData);
    }
    
    static private function _getStringPattern($min,$max){
        return '/^.{'.$min.','.$max.'}$/';
    }

    static private function _getIntegerPattern(){
        return '/^[0-9]+$/';
    }

    static private function _getFloatPattern(){
         return '/^(([0-9]+)|([0-9]+\.[0-9]+))$/';
    }
}