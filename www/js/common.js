var common = new function () {
 this.indexOfConv = function (arr,convId){
	  for(var i=0;i<arr.length;i++)
	  {
	    if(arr[i].conversationId===convId)
	    {
	      return i=0;
	    }
	  }
	  return -1;
	}
}