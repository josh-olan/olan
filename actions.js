function changeone(text)
{
    let txt= text;
    if (document.querySelector('#r1').innerHTML === 'Reveal')
    {
        document.querySelector('#r1').innerHTML = 'Hide';
        document.querySelector('#a1').innerHTML="Cycling";
    }
    else
    {
        document.querySelector('#r1').innerHTML = 'Reveal';
        document.querySelector('#a1').innerHTML="";
    }
}

function changetwo()
{
    if (document.querySelector('#r2').innerHTML === 'Reveal')
    {
        document.querySelector('#r2').innerHTML = 'Hide';
        document.querySelector('#a2').innerHTML="Dancing like Michael Jackson";
    }
    else
    {
        document.querySelector('#r2').innerHTML = 'Reveal';
        document.querySelector('#a2').innerHTML="";
    }
}
function changethree()
{
    if (document.querySelector('#r3').innerHTML === 'Reveal')
    {
        document.querySelector('#r3').innerHTML = 'Hide';
        document.querySelector('#a3').innerHTML="PROGRAMMING!";
    }
    else
    {
        document.querySelector('#r3').innerHTML = 'Reveal';
        document.querySelector('#a3').innerHTML="";
    }
}

