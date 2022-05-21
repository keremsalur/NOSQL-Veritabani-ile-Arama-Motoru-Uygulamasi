let suggestions = [
    "Ali",
    "Kerem",
    "Murat",
    "Kemal",
    "Ahmet",
    "İhsan",
    "Cemal",
    "Cenk"
];

const searchBox = document.querySelector(".searchBox");
const inputBox = searchBox.querySelector("input");
const suggestionBox = searchBox.querySelector(".suggestionBox");

inputBox.onkeyup = (e) =>{
    let searchData = e.target.value;
    let emptyArray = [];
    if(searchData){
        emptyArray = suggestions.filter((data) => {
            return data.toLocaleLowerCase().startsWith(searchData.toLocaleLowerCase());
        });
        emptyArray = emptyArray.map((data) =>{
            return data = '<li>' + data +'</li>';
        });
        searchBox.classList.add("active");
        showSuggestion(emptyArray);
        let allList = suggestionBox.querySelectorAll("li");
        for(let i = 0; i < allList.length; i++){
            allList[i].setAttribute("onclick", "select(this)");
        }
    }
    else{
        searchBox.classList.remove("active");
    }
    
    //console.log(emptyArray);
}

function select(element){
    let selectUserData = element.textContent;
    inputBox.value = selectUserData;
    searchBox.classList.remove("active");
}

function showSuggestion(list){
    let listData;
    if(!list.length){
        listData = '<li>' + inputBox.value +'</li>';
    }
    else{
        listData = list.join('');
    }
    suggestionBox.innerHTML = listData;
}
 