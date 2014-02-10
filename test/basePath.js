/**
 * Created by dmccarthy on 11/10/2013.
 */


function isCover(){
   if (typeof global.process.argv !== 'undefined' ){
      for ( val in global.process.argv ){
         if( global.process.argv[val] === 'test' ){
            return false
         }
      }
   }
   return true;
}

var path_base = ( isCover() )? '../build/instrument/lib/' : '' ;

module.exports = path_base;