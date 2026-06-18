document.getElementById('cta').addEventListener('click', function(){
  const el = document.createElement('div');
  el.textContent = '谢谢你的点击！';
  el.style.marginTop = '1rem';
  el.style.color = '#0078d4';
  document.querySelector('.hero').appendChild(el);
});