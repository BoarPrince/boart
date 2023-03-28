// insert tr to example tbody for horizontal dash line
const nodeList = document.querySelectorAll('.example tbody');

for (const tbodyNode of nodeList) {
    const tdNodes = tbodyNode.querySelectorAll('tr:first-child td');
    const trNode = document.createElement('tr');
    tbodyNode.prepend(trNode);

    for (const n of tdNodes) {
        trNode.append(document.createElement('td'));
    }
}
