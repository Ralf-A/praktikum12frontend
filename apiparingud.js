async function postFormDataAsJson({ url, formData }) {
    const plainFormData = Object.fromEntries(formData.entries());
    const formDataJsonString = JSON.stringify(plainFormData);

    const fetchOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: formDataJsonString,
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }

    return response.json();
}

async function getDataAsJson(url) {

    const fetchOptions = {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    };
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
    return response.json();
}


async function deleteObject(url) {
    const fetchOptions = {
        method: "DELETE"
    };
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
    listiraamatud();
}


async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    let url = form.action;


    if (form.id == "otsinguform") {
        if (form.querySelector("#raamatu_id").value.trim() != "" && form.querySelector("#sone").value.trim() != ""){
            url += `/${form.querySelector("#raamatu_id").value.trim()}`;
        }
    }
    try {
        const formData = new FormData(form);
        const responseData = await postFormDataAsJson({ url, formData });
        console.log({ responseData });
        handleResponse(form, responseData);
    } catch (error) {
        console.error(error);
    }
}

async function listiraamatud() {
    const responseData = await getDataAsJson("http://localhost:5000/raamatud");
    const resultElement = document.getElementById("raamatud_result");
    resultElement.innerHTML = "";

    for (var raamat of responseData.raamatud) {
        const fileName = raamat.slice(0, -4);
        resultElement.innerHTML += '<a href="http://localhost:5000/raamatud/' + fileName + '"  download="' + raamat + '" >' + fileName +
            '</a> <a href="#" onclick="deleteObject(\'http://localhost:5000/raamatud/' + fileName + '\')" > [kustuta]</a><br />';
    }
}


function handleResponse(form, responseData) {
    const resultElement = document.getElementById("tulemus");
    resultElement.innerHTML = "";
    
    if (form.id == "frontform") {
        resultElement.innerHTML = responseData.tulemus;
        listiraamatud();
    }

    if (form.id == "otsinguform") {
        if (responseData.leitud == 0) {
            resultElement.innerHTML = "Seda sõna ei leitud ühestki raamatust!";
            return;
        }
        if (responseData.sone == "") {
            resultElement.innerHTML = "Palun sisesta sõna!";
            return;
        }
        if (responseData.leitud > 0) {
            resultElement.innerHTML = "Raamatust " + responseData.raamatu_id + " leiti sõna " + responseData.sone + " " + responseData.leitud + " korda";
            return;
        } 
        if (responseData.tulemused) {
            if (responseData.tulemused.length == 0) {
                resultElement.innerHTML = "Seda sõna ei leitud ühestki raamatust!";
                return;
            }
            const resultList = document.createElement("ul");
            for (const result of responseData.tulemused) {
                const listItem = document.createElement("li");
                listItem.textContent = "Raamatust " + result.raamatu_id + " leiti sõna " + responseData.sone + " " + result.leitud + " korda";
                resultList.appendChild(listItem);
            }
            resultElement.appendChild(resultList);
            return;
        }
    }
}

