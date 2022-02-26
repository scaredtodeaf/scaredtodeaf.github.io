// Generate - From Oceanity website with Permission
const groups = document.getElementsByClassName("sfx-group");
for (let group of groups)
{
	const children = group.getElementsByTagName("div"),
	title = group.getAttribute("name"),
	header = document.createElement("h2"),
	list = document.createElement("ul");
	let entries = [];
	header.innerText = title;
	// Create child elements
	while (group.firstElementChild)
	{
		const child = group.firstElementChild,
		name = child.getAttribute("name"),
		text = child.innerText;

		if (name && text)
		{
			const entry = document.createElement("li");
			entry.innerHTML = `<pre>${ name }</pre> ${ text.replace(/(\[[^\]]+\])/ig, "<span>$1</span>") }`;
			entries.push(entry);
		}

		group.removeChild(child);
	}
	group.append(header);
	group.append(list);

	for (let entry of entries)
	{
		list.append(entry);
	}
}
// Copy on Click - From Oceanity website with Permission
const pres = document.getElementsByTagName("pre");
for (let pre of pres)
{
	pre.onclick = function (e) {
		document.execCommand("copy");
	}

	pre.addEventListener("copy", function (e) {
		e.preventDefault();
		if (e.clipboardData)
		{
			e.clipboardData.setData("text/plain", this.textContent);
			RECEIVE_CALL((e.clipboardData.getData("text")));
		}
	});
}

function toggle_visibility(el) {
	event.preventDefault();
	el.classList.toggle('expanded');
}

function toggleAll(ele) {
	event.preventDefault();
	var lis = 'expanded';
	var titles = document.querySelectorAll('a');
	if (ele.classList != '') lis = '';
	[].forEach.call(titles, el => {
		el.classList = lis;
	});
}
