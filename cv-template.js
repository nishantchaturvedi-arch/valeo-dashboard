/* Valeo caregiver CV — one template for the dashboard (Caregiver Profiles) and profile.html.
 * valeoCV.html(p)      → HTML string of the CV pages (Letter size, 816 × 1056 px)
 * valeoCV.download(p)  → builds a PDF in the browser and downloads it
 * p = {name, role, location, certified, languages[], experience_years, objective, skills[],
 *      education:[{title, detail}], experience:[{title, sub, bullets[]}], photo}
 * Older profiles (headline / bio / specialties / education string) are mapped automatically. */
(function(){
  var NAVY = '#0E3A5E', YELLOW = '#FFB900';
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function base(){ var s = document.currentScript && document.currentScript.src; return s ? s.replace(/[^\/]*$/, '') : ''; }
  var BASE = base();
  var LOGO = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAZABkAAD/4QAqRXhpZgAASUkqAAgAAAABADEBAgAHAAAAGgAAAAAAAABQaWNhc2EAAP/sABFEdWNreQABAAQAAAA8AAD/2wBDAAQDAwQDAwQEBAQFBQQFBwsHBwYGBw4KCggLEA4RERAOEA8SFBoWEhMYEw8QFh8XGBsbHR0dERYgIh8cIhocHRz/2wBDAQUFBQcGBw0HBw0cEhASHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBz/wAARCADIASwDAREAAhEBAxEB/8QAHAABAAIDAQEBAAAAAAAAAAAAAAUGAgMEBwEI/8QARxAAAQMCAwQGBwMJBwQDAAAAAQACAwQRBRIhEzFBUQYiI2FxkRQyQoGhscFSktEVJDM1c4KissIWNENEU2LhVHKT8CZj0v/EABsBAQACAwEBAAAAAAAAAAAAAAAEBQIDBgEH/8QAQREAAQMBAgoHBQYGAwEBAAAAAAECAwQSIQUREyIxMkFRcfBCYYGRobHBIzND0eEGFDRScrIVU4KSovEWYuLCNf/aAAwDAQACEQMRAD8A/fyAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIDkqquGjaXyvDQATbjuJ+hUeaojgbakXnlDNkTnrmkdB0jo55Wx5suaPPe4OXuNtxsq6LDdNI9rU2pj/2SXUErW2usmg4OFwbhW7VtEPEZLIBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEBqlmbCzM7ctckjY22nGTGq64g6/GxGH7MbgT8Cfp/ECqSqwpZa6zzdj54opNio7Wtzz6EBUTSVEwzvbcmZmZxAGkQGpPeSVQSyOmkznfnS/9Cc9pZMa2NuNv/X9xHxtYC6CkzTTyjK6Tc0DjYH4kquYjW+wgznLdj2dnzXYSVV2vLciEzRYu+EvMbs0WaQNPMMAcbfH7yuqfCCxuc5rrsbv8URfn/cQZaVHa2m7xu54FjpsUjl0fZpG88OP4X8F0kFc2TNdzz5FZJTubqkorEjBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEBBYp0lpcMkEVnSynUhtrAd5VJXYcgo1s6y9ROpqCSZtrQh14XjFNisO0iNnA2LHbwVLoMJQ10dqPuNNRTPgdZcSSsCOEAQBAEAQFUx3ELTStaR2IcAe8AH5uZ5Ll8K1vtHNZ0cfeiY/NW9xaUcGa3r59FIac3E44MdO0dwDWAfJUk3S6lencjULCPQ3+nzUxraUFpdK7Zwtnlu/ifVFgOJ0XlVBabaldiajnX9yYk7vmIZfy3riT1OZpfJCWwgUtENHSOOru4neT3BRktSR+yzI9q7+O/gncbsTWuzs53POM+iVgjkkjBEELDEy+97nAgny17tFm2Rtlzm6rUVE61d9O64xVrrVl2lb+4kI5nxOe3jH1dd2YRgn+JgU1kjo3Obuu7Uanq1COrWu7fn8lLVhFU2qpd4OzOX3WBHwIXW4NqMtDw/2ngqFNUx2JOPPmSisDQEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQGionbTxF7u4AcyTYLTLK2FtpxkxtpbJWK3GpZiGxG2b1QNLnKXDz6vxXNVOE3vzGbdH9uNP/nxLWKka29/N+L5lYq27SKKobqC1rD3OaAPiACuXqEyjWzs3InaiYvK8toc1zmLzjOvBnlpABtmniB55TmBt5qVgtf3t7lxovmaqxPJfQsmG444xxmcXDmtJPHcb/yu+AXS0OFlstyu5PX5L4IVM9Glp1nnnGhZAQ4XGoO4ro0UrTJegIAgCA89rSZXVh3kum/naF89qVdI6bi/9yHRwpZs/wBPkptMLZJZ2n1XyPN+4ygX8mFSFja6RzdiuXxeieTVNdvE1qpuT9v1Iw2OaqqrkPJdHDf1rm5J5Nv5qqWz7+fbeib/AJJ5+JLb/Ki7+dolG6WtLhp1KduhA4dzR8fmvZE+LU9jU5zU8V8Qz8kXfzpMg4tDKidgZEzWCnA0ceduXMnes7dmzPK3E1NVu/6b1XTo4eWdLGadqmxl4tJNXsjknlJ4Oe2wB+Hms22m62lEc5eLkxJ6d5g7O1d6InYWXos87SrjPsxwH+C30XR4AV1qRvUz9pW4SRLLXdbvMsq6UqwgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCArnSacx+jxjc9kzj7mH8Vz+HZnNsRJtR69zV+ZY4OYjrT/wBPmVh15C5sbrPe1k8LhzAsQPLzauXdadmt04mub2JenO1C1bm63Wi886TEGN/WOVtPWaO5RyDj5m/gVjaa7O0Ml8Hc+CmV7eLfFOfE+YZmpqmaOQWfFZ1uRY8E/AFY0NqGVzXaUv8A7VRfLGe1PtI2ubt9UO+FphdDGfWYY228JnAqfG3Jua3allO56oR3Kjkc5Ov9qFowCXbYRTOJuWgs+6SPouqwTJbo2dV3cuIp6tlmdxLKzIwQBAEBQmtaZnSH9GXFx8DI5x/hiXC5tq1s/wDau8mF/wBGymn6YvNx8kqYsPbacZ35TZnNwBab92Z8qwdPHSt9reuLR16PNXmSMdLq87fJGkf2kcokkbta+axYzLfZjgbc+Q4KC6011p18rtCbt30TYb0subZbcxOf9nwN2MuVo9KrnnU+sGk8vtHv3LFPZyWWe0kXtxfNfAy1m/lbz3Hy7YJTJK70qsJ0HrNB7z7R7hoiubG+051uTvTt38NHkEzm2W5ree42CI5jTSP7Z52tU7flA4eI49+i2ZPOyDnXre9d3V8+vEhgj/iN0aGlp6KsdJT1NW5tvSJSWj/aNAunwA1zo5Kl3Td4FThF1lzYtyFjXRFcEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQFa6VxlkVLWAZhTyWc3m12h+VlzuH2OZHHUpfYW/gpZYOW050W9CsCNzM0MbiXw9tTv4lu8jx4+N1zFhzfZNde3OavVp+vFFQtUXpO23KfezkPstpqzyjkH0ufuuXns3dTJf8Xc/4qe5zf1N8U58UMC5wLakt7alIinaeLdwJ93VP/K8tubZnc3OZc5PD/yvZvPUa33Wx16c+JMSRXi2kfWuLtPO2Vw+LR73q2dHm2m38ovm1O15Ba7Etl3OlPXwJ7AAGUBjBuI5XgHmC4kHyK6DBCWaazuc7zxldWe9t70QmFakUIAgOWsmNNSzSgXcxpLRzPAKPUy5GJ0m5DOJlt6NKtDTBoAuCG2FzuIAA8tL+Ei5eOGz2fT5dz8ZbOdzzzjaQz5mySy1rhmjYckId7ThxI7vWPeqR8jXSOqXXolzeteb1616yc1ita2JNO3nwMcksbjC05q2a5lcT+jB3i/A8z7uaYpGuyTfeO1l3c9Lu3nuNrs7opo6+dh8ZqHw0pDYgO2qHaXHzA5DeV4zVdFBc3pO52dWlfL1fzy6diCEm5joGuuB1qh1gQOd9zB8e9eRr0aRvFy85qePWeu/NP3c6TZR0prJRQURzZ7GafWxA/p+ZW2np3VD/ulNt1nc7PNewxlkybcvJ2JztPQ6anZS08cMYsxgAC+hQQthjbG3QhzMj3SOVzjoW4xCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIDRUU8dVBJDK27HixC1SwtmjdG7QpkxyxutNPPZqaWjkkpC61TRkyQu5t3kD+b7y+eywSU8joOmy9vDT9e86RkjXtyvRdp58O4xtHJoMraes1HKOXl4a+TlhZa7N6Mvg7n/FTLObxb4pz4ofNoW2nkYS5nYVTOJG4Hx08wvLfxXN0Zr055xoinlnot4t55uJLBZxFUfk6V1wdYJd1wdR+I71ZYNkyc33OV36V8U+m5SNVstNy7e1CyUEDqSV8ZbZjrW5XA/DT91dNRxOge5uxefLy6yrmc2Rtrnn5ksrMihAEBGV4fPlijBtcOJHw/HyVfVo6TFG3nd8+OIkQq1uc4reNTbJzcNpspmltmI0DRy7tPILmsKyWXNoYNZdPVz4IWdI217d+hOeesitoxnbt1hp+ygBHrP33I/i8gqm21vtW6rbm9a7/AF7kJuJzszat68Obu8x2LgHUoflkIz1Up1yga2Phx5le5NzfYWr9L13dXZ4uuFv4i/0pzziPhyTwgnNDQRGzWj1pHfU9+4LFbMjc7NiTvVfn4J5+3tXe9fDnxO2gwmrxpoytFNQNOg4e77R7yplHg6fCGrmR8969ZpnqY6XTnP57i5YbhdPhcGzgbv3uO9x712VHRRUcdiL/AGUU1Q+d1p5IKcaQgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgK50mw90kLa6n0qKbW43lq57D1E58bauLWZ5fQscHTta7Iu0OKtljkJjHVp6zrRco5Bw+NvAgrl7DXZrdWTR1O3enBUUtrTkztrdPWg226okBP+BVM4kcD46eYWOU+O79L09eekh6jeg3i3nm4xdC9rXQg3npevE4e1GddP5h714+N1nJdJl6Lvbp/wDSdp61W6+x2njzcTGH9IJIZYDKWuo5zYg74n8QO6+vgriiwvJG5mUvjd/ivy28CDNQtc11nWTxQsdPjNFUCTLM1jojZ7X9UtO7W66SDCdPNazsSppx3YirfSysvs6Ts9IhtfastzuFLy0em0hqybtxyVOMUNJHtJKhhBOUZesSeWiizYSpoW2nPTsv8jbHTSyOstaQGI44+aeaKI7OmgbeZ25zj9i43a6aKgrsLukkdHHcxutvXq9O8saeia1qOde5dHzIJm0kBfvq60lo4WYTYnuvu8LqhblHZ3Tl8tvfo4YyxdZTN6LfMy2jGds3WGk6kN/ak33/AKvILK21vtW6rLm9bt/r3IeWXOzdrtPDm7vAhyg0rnloA21W/iOQ91/vFeZP4Dv1PX056Si18TsbzzcSeC4OcYlFVOzJRRdWKIcQOH4nirXBmDv4hJl5W4o00Jz4rtUiVdT93bk2ay6VLqxjY2hrAA0aADQALtGtRqWWlEq4zYsgEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQGJAcCDqDwXioDz/EsN9ErZaE6QVHXgcdwdwH9PkVwVdQ/d53U3Rde3jzd3KdFT1GVjSbamnnxOXbB1qiQGzuwq28e4+Ol/EKHlPju25r/nz0kN1noN4t55uAEkXVBaaik6zHcHR7/eNb+BXlmSPN6cV6dbeb+CqeJZdfsf5mIZHmMQ0pawZoydzH8L+B6p7tURkdrJdCTR1L9Fu4Xntp2K10m+XN5kJC208jCS3sKpnEjcD46eYWVv4rm6M16c8406xi6DeLeebjjdSPFV6O3rEkBp4EHUHwI1UJ9M5s2Qbfu9FN7Zm5O2dokjjBmj1hpeyg/3SHW/9XkFMttb7Vuqy5vW7f69yGhGq7NdpdevDm7vMDALtpHGzWdtUu5Hl7hp4uXmT1aZ2zOfz1aP1Kp6j/i9ic83GYe9/aNbaer7KFg9mPdp/L95MbnZzW5z7mpubo+neeI1rc3Y29ePN/cfM0cR2retBSdWLlJJvv56+FgsrbW5zdWPR1u3+vBEQ8sudm7XaepDdSUElXPDh4JzPO2qH8R3e4HzK209I6okbSbVvevO7zXqMZJmxtdP2JzzcX+GFkETYoxlY0WAHAL6BHG2NqNboQ5tz1ctpxvWw8CAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAh8fwsYnQPawDbM60Z7+SqcL0H32Cy3WS9OeslUVR93k6lKXtmvPpMnqS9jUt45uD/E2v4hcZlGu9u7Q7Nf8AP14opfWfhN2Xp8udg7SPTqmpotQd4kjOvvGvkU9pH+uLxbz4L1BLLv0v8+fEbFj7wM/RVHa05PB27L7/AFfJY5NrvYN1XXt47vTuUW3Nz3aUuX5+veBKHtFTILtcNhUt49zvhfxajZGu9u7bmv8An68UFj4beKc83KYGSoilFGGsdN+iY8etldutraxvy9pYq+aN33ZrUV2hF24l3ccfcpkjY3Jlcd2nuM87IiZW9aCk6sXKSTn8L+FgtmNrc5uqy5Ot2/14IiGGJzs3a7T1IYth0FO42c/tqh/ENGoH18XBYtjzcg/bnOXcnN/FUTYeq++32IZh75Lysbaap7GnYPZZuP8A+fNLbne0a3OfmtTcmj6d4RGtzXaG3rx5v7j5eOPrDK6no9G8pJOfhpfwC9xtbnaWxaOt3PgmIXu4u8E58S29GsNNJSGomN6mp67id4G+31XW4DonQRZaTXfeU2EKjKSWG6rSfV6QAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAICk4/RNoq909vzOs6stvZdvv/UuLwxSNpZ8ovu5NPUvN/eXlFNlorHSbo58CJ7SPXfU0W/iJIz8xr5HuVV7SP9cXi3n/ABXqJea79LvPnxAha/8ANoz1Ju2pncQdxb77ZfEBMm13sG6HZzOO704ogR3xXbLl+frwG2Y9wqX/AKGfsqgDg7fm/qHfdY5Rrvbu1XXO47//AK440FhU9k3Sl6c+BhtZopPRdiHVTQYWvF75Ty4HfoeSxWSSN2Qs436qL1Lzcu4zRjXNytrN0mzs2H2XUtH5SSn8SPutWfs2u3si/wAnfX9qGOd/U7wTnxU+bNz+xkfaWftqiQ+y3eB/V5Lyw53snOvdnOXcmn69wx2c9uhLk58O8CRz+2jbaWbsKdg3gbifp43WVtzvatbe7NanVo+nHGeInQdoS9TuwjD24hiDIRZ1HR6vPCR53+ZHkFOwbQtqp2xfDi09a8+CGipnyMVrpO8E58S/LuznwgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgOPEaKPEKSWnk3OGh5HgVFrKVtVC6F202wTOhej2nn52kJOYfnVEcj2n2492vnbwK+frlI9bXiuXrbzdwVNx0ea79L/PnxGxDr00ZNn9tSO434jxNreLV7k7XsG7c5ny9P1IeWviO4O55uG0ZLeZ2kNX1JrezINb2/i8wvLbXe1fqvud1O3+veh7Zc3NTS3Rw5u7jWZ5IZNiYb1kYMLXg8DoNLam2gK1rM6N2Sc32iZuPnwUyRjXNtWs1bzZljYdmcrqej1fykk5eYt4BbbMbc117YtPW7d6cEVTFHK7O2u8E58RlfI0xOfaaq7adx9mPeL/zfdWNlzs1zs597l3Jp+vcLTW52xtycebu8bQuvPGwhz+wpWcQ3cT46+ZWVv4rW6c1ic841VTyz0HcXc83F5wXDW4XQth0znrPPMruMF0TaOnbHt28Shqp8vJa2EmrEjBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEBUuk9CYHsxOFoOXqTN4Fu7X5LlsPU2Tc2tjb1O4c3Ftg6W01aZ3YQGx/wAtGSf8elfxPNvjp5hc/k/gN/UxfTnpIWVrpu4O55uGaOU7V3Vgq+rLyjk3389fC4S212c7Vk09Tt/rwVUPLLm5u1ujrQw200UoiNNetYNk1+t+QNhvNtxWrKSRyZJ0ftEuTnyUyybXNtWs3SZ5I47ROs6Ck60tt0kh4X+HhcrbYa3Ndqx3r1u3enDGpjac7O2u0dSDJJLeNxtPV9rK8+xGNdf5vJeYnOzX6z73dTdP14Yj3G1udsbcnHm4mejVE2tq3VrmWp4OpA0/P6+JV1gSmy833lzcxtzeeb1IFdLk48htXSXNdgUwQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEBolhZPE+KQZmPBBHctckbZGuY7Qp61ytdaaef1NFLSVE1CXHawna07+JG8j3gX8Qvn09LJTyOpuk29q88406zpI5WyNbNsW5TQ6SO21I/Nar12t/wAOQcQPfcdzrLSr4/edB+nqdzenUuIza12r0m+KBvpAi2bMRZsNw7UgW8N/wXjctZstnSzxXy0+B7jjx2nR38D5HsSNmLmkp+u8nQyHcB79w95RmTdmt1G3r1rzcnaoW0i2ukvgbY4paqRsI1q643cfsx7x8r+AC2MjkmVsTdeXwbzfwRDBXtjS30WeZ6BRUsdFSxwRjqMFh3819Ap6dtPE2KPQhzksjpHue46lIMAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgK/0mw81NMKqE2qabrNI3kf+6qhw7ROmhy0Wuy8sMHT5N+TfquKjdxD56ZrXwvF5qci4afAa25Ebty5LG51qWBuNq6zd303KmjQXGLoSadimgPot/o84P2RKLfyqLbpv5bu/wD8m+zN+ZO76m4dpG2SZjYaFpu1g0Mh7r6k8zw+CktzmtdK2zGmzf8APjs8DRqussvd5c7iz9F6FxEmJTt7Wf1Byb3f+7l0+AaR2dWy6z9HDnwKvCE7boGaELQulKsIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAqeKdFXGY1WHP2Uu/JfLr3EblytfgBzpMvSOsru+RbU+Ec3Jz3oRRwzHM2U013fbswnz/5VStDhW1Zyd/8AT5k37xR/m8yRw/otNLMJ8TlzHfkvmJ8SrKj+z8kkmVrnY+rT3qRZsJNayxA0tzWhrQALAaABdY1LJTGSyAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAcWIzy09FNNA1rpGDMGu3EcfgolZM+GB0kbcaobYGNkejXaFK5hvS2WrrYYJoYmxyHLmF7g8N55rnKH7RyTTtilaiIpaVGDGxxuc1y40LguuKYrnSDH34RLFFCxj3vBc7NfQcNy57C+GXUT2xxtRVLGhoUqGuc46sAxGoxSlfPNGxgzZWht9e/VS8E1stZE6WVqJfcaayBlO+w0mVbEQqmM9KJMPrn00ETH5AMxdfefArl8J4efSz5GJqLiLWkwe2aPKOcd/R/Gzi0Mpka1ssR1Db2twKnYHwo7CEbrTcTkI9bSfd3Ns6FJxXRCCApH9sqvbbPYQWzW48/FcT/yWot2LDdPWXn8Kjs2rSl3XbFGEBB9IcXkwiCGSJjHF7iDmvy7lS4YwlJQxtfG1FxqTaGlbUOc1xBf21rP9CD4/iqH/AJTU/wAtviWX8Hi/Mp14T0nqMQxCGmkhia2S9yL30BPE9ym4Nw9LV1LYHNTEuPyI1Vg+OGF0jXKW5dWVJxV+IQYbTmad1m7gBvJ5BRKqtipI8pKptggfM6ywqFV0yq5nEU8ccTOBd1nfguRqPtLO5fYtRqd6l3FgmNPeXmmDpfiEZu4xSjkWW+S0R/aSta7OxL2fIzfgqB2rcWjB8fp8VblAMc4FzG76HiuowbheGtzdDt3yKiqopKfrQmlcEMIAgCAIAgCAIAgCAIAgCAIAgCAID4QHAg6goDy3E6Q4diM0I0yOu0928L5bX07qOpdHuW70OsppMtCjlPRcMq211DBUD22gnx4/FfR6GoSpgZNvT/ZzE0WRkc089xWrOI4pPIzUOdlYOY4L53hGd1ZVuc3auJPQ6aljyMKNceh4fSNoaGGmH+G0AnmeJX0akp208DYG7EOZmkysjnrtNtTUNpaeSd/qRtLis55WwxukdoRDCNiyORrdp5iyOfFKx+UZppS558iSvmDGS107rOs7GvqdYro6aPqQ7ejNaKLFormzJuyP0+KnYBqvu9W3c67ntNGEYcpA7qvPSV9HOYCA8l/zX7/1XyX43adj8M9aX1o44ICqdNv7nTftPouV+1XuY+JbYH944iOjsWGPjqPygYbgjLnfbnfiqnAkdC5r/veLZixqTK907VbkcZZsPpMG9ID6IQmZgJBY4kgbufeumo6bBuVtU2K0m5SqnkqrNmXHiJxXRCPNukmIGsxOUX7KAljR4bz5r5xhysdUVbm7G3IdPg+DJxIu1SwYH0Zp4qZs1XEJJ3i+V+5oPC3NdDgrAUUcTZKhuNy+BWVmEJHOsxriQ76zo7QVcJaIGRO4OiaGkHwG9WFTgWknbZsI1d6XEeGunjdrY+JRHsnwnEC2+WaB2hHwPvXAyNloamz0mqdE1WVEXUp6XRVAq6SKcbpGh1uVwvptNM2ohbI3ahykrMm9zNx1LeYBAEAQBAEAQBAEAQBAEAQBAEAQBAU7ppRawVjR/wDW75j6rj/tRS6lS3gvoXOCJdaLtODCsZ9EwOvgJ7Qfov3tPhvUDB+E0p6CWDbs7flpJNRS5SpY7Zt7DX0VovTMVbIR1IBnPjw+Oq1/Z+ly1W1ztDb/AJGWEpbENneeiL6Gc2VbpjWbGjjpmkZpjd3gP+VzP2lqsnTtgZ0vJC0wVFakWTcRXROSlpZaioqZ2RPtkaHEDvJVV9nXwQvdPO9EXQhMwmkkjWtjbjIrFGRRYjP6NIHRF2ZrmnTnb3Knr2sjqZMi7G3HdiJlMrnQtymk9DwisGIYfDPpmcOt4jQr6Jg+pSqpmS84zmqiHIyuaSCnmg8l/wA1+/8AVfJfjdp2Pwz1pfWjjggKp02/udN+0+i5X7Ve5j4ltgf3jivYTgc2LMlMUrG7MgHNf6Ln8HYKfhBrnRuRMRZ1Va2nxWm6Sz9H8AnwmpllllY4OblAbfmO5dRgfBEtDK6SRyLjQqK2tZUMa1rSyroitPKsSjdFiNVG7eJXb/FfKq5jo6mRrvzKdfTLaha7qPTKSoZWU8c0Zux4BC+n08zZomyN0KclJG6NzmuOlbjE8z6QVDKnF6l8erQQ2442ABXzPDM6TVsjm6PkdRQRujp2tcXrBGGLCKRrtHCMEj4ru8FMdHSRMduOfq3Wp3cSSViRwgCAIAgCAIAgCAIAgCAIAgCAIAgODFaMV2H1EGl3t08RqFBrqVKqmfFv8zdTS5KVrzy8gg2OhC+XnXl96JUXouGbUjrznN7hoPxXf/ZymyNJlHaX39mw5vCcuUms7ixK/K48zx+sFdikxabsYcjfAf8AK+aYZqvvNW52xLk7DqaCHJQoSUfQuofE1xqGNJAJaQdO5WbPsxK5rXOkRCKuFmIuqceK9HJ8JpRO6VkjbhpsCLX4qFhDAktFFlHOxobqWvbO+xZxEn0KrrPqKNx39q3x3H6K0+y9Xe6mdxT1IuFotWXsLmuxKQ8keS2Z5G8OJHmvkj3WZHcTs26hLf2qxP8A1h90fgrf/kNf+bwQhfwyn3FzwWpkrMMgnmN5Hgkm1uJXaYLnfPSMlk0qUNXG2OVzG6CG6bf3Om/afRUv2q9zHxJ2B/eOK1h2MVOFiQU5aA+xNxdczR4SnorWR2lrPRx1F7iawfpHXVuJQU8pZkeSHWZbgSrzBuHKuoqWRSYsS9RAq6CGOFz2l2XaFGVPpPgElUTWUozSgWe0b3DmO9cph3A7pnfeYdO1C2wfWtj9lJoK5h2NVmFZmRPBjvqx4uL/ADC52hwrU0ObHo3KWk9HFUZzjqrOlNfVxGMZImnQll7n33Uqp+0FXO2zc1Oo1Q4Nijda0n3AcBlxKdssrXNpGm5J0zdwTA+B5KyRssrcTE8TytrWwtst1j0MDLoNy+hnNn1AEAQBAEAQBAEAQBAEAQBAEAQBAEAQHAcLoXEk0dOSdSTE25+ChrQUzltOib3IbUqJUutr3nUxjY2BrQA0CwA0AClNajUstNarjNqyPDgGFUANxRUwI47Jv4KGmD6T+U3uQ3feJvzr3nephpNE0Mc8ZjlY17Hb2uAIPuWuSNkjbMjcaHrXKi2mmmLDqSF+0ipYGP8AtNYAfgFpZR08a2o42ovBDN00jksucp2qUazhOFUB1NFT3/ZN/BQ/4fS/ym9yG77xN+de8+fkqg/6Km/8TfwXn8PpP5Lf7UH3qb+YvedMUTIIxHExrGN3NaLAe4KSyNsbbLUxIalVXLacYVFLBUsAnhjkA1Ae0G3msJYIpveNReJ6x7marsRp/JVB/wBFTf8Aib+C0/w+k/kt/tQ2fepv5i959iw6jhfnjpYI38HNjAI99lmyipo1tNjai8EMXTSubZc5e87lKNYQHBVYTRVhzTU0b3fatY+ahT4PpqjOljRVN0VRLHqONFP0ew2n1ZSMuPtEu+a0xYIoo3WmRp5+ZsfWzu1nEoAGiw0A3BWSIRTJegIAgCAIAgCAIAgCAIAgCAIDVI9kLC97mtaN7ibBa3vaxLTlxIeoiuzWmuOrgnOWOaN5tezXAlYR1EUi2Y3Ivaeuje3WaZySMiZme9rWjeXGwWb5GxttOXEh4iKuqYR1cE5yxzRvNr2a4ErCOoikWzG5F7T10b26zTZI9kLC97mtaN7ibBZve1iWnLiQ8RFdmtNUVZTzHLHPE93JrwSsGVEL1sseirxPVjems02ySsiYXPeGtG8uNgtjnta2065DxEV2qbVmeBAaXyMjAzua3MbC5tcrBXtbrKeoiu1T66RkZAc4Au0aCd57l4rmt1l0hEVTYTl1O5bDw0RVMFRcRTMeRvDSCtMc8Uma1yKZKxzdZDoW4xNDZ4zDtRI0x2vmuLWWvKMs5THdvPbLsdnabQQ4XGoO4rNFPDnNZA1+zdNEJPsl4v5LStRC1bLnpj4mSRvxWrJ1LeYhAaJZ4oG3lkZGDoC4gLTJMyP3jkQ9Y1ztVD7FLHK3NG9rm82G4WTJGvbaYuMK1U1j7I9kLC97mtaN7ibBHvaxLTlxIERXZrTVFWU8xyxzxPdya8ErBlRC9bLHoq8T1Y3prNOguDWkk2A4lbVXEYmqKoinB2UrJLb8pBWEczJPduRTJzXN1kEs8UDbyyMjB0BcQF5JMyP3jkQ8Y1ztVDCKsp53ZI54nu32a8ErxlRFItljkXtPVje3WadS3mIQBAEAQBAEAQBAEAQEP0j/AFPUaX1Zp++FUYb/AAMnZ+5CXg/8Qnb5GzDo3tc90lBBTG1gY3BxPkAt9HGrVc50TWcP9Ia5nJizXq41dI/1W7TN2jNDx6wUfDX4Xtb5m2g992L5G3Do3tc90lBBTG1gY3BxPkApFHGrVc50TWcP9IapnJizXq419I/1PUaX1Zp++Fow3+Bk7P3IbMH/AIhO3yNmHxva5zpKCCnIGjo3BxPdoAttJG5Fxugazhf6IYTORW5siuMekf6kq/AfNa8M/gZOdplQfiGksrYihAcVfRMxClkgcbZtzhvB4FRKqmbVROjd/pTbDK6J9pCLwjb18pq6oNzU94WNG7MNHO96rMGNlqZPvFRpZmpx6S9pLqrMLcnHtv8Akh0Y/rRxMccsckzGSH/aTqpGF19g1uxzmovDGaqH3jnbURcRoxOkp6Q0MsETIpRUMYMjQLg6EH3LRXU8VPkpIURrraJd17DZTPfJlGyLjSypYFekArNKf/hzv2D/AJlc1B/+H/SvqWkn4/tQnaP+6w/9jfkr+n903ghWv13FYqqiCnrMWdPQektzt61m2bdoGpO5cxPLFHNUulitpjS+667fsLWNj3RxWZLJYMIgfTYdTxSuDpGsAJBuPNdBg6F8NMyOR2NUQrql7ZJXOaSCmmkgekALnYeBE2Y7fRjjYHQ6HRUuF0dagsttZ+jsUnUXxM7FcacLa6PGahr6dtMXwhwiYQWkA2JuOOvJaaBro66RrmWMbUuTRp08TKdyOgbZdav0nZ0j/U9RpfVmn74UnDf4GTs/chqwf+ITt8jZh8b2uc6SggpyBo6NwcT3aALbSRuRcboGs4X+iGEzkVubIrj5jdOKqgkh2zIi4tsXmzSQb2KYTiy1M6K0iY8WnRp0dopX5OS1ZxnFQhkWJxiajFLUvjcGmIgxyDQncOCh0qNjqmtkisPVF0aqm+W06F1l9puPbpQmaimgqWBs0LJGjUB4BHxVxLBHM2zI1F4kJj3M1VxEV0apYBhdNMIWCZzSC8AXOp4qqwHBC2kjka1LWLTt0kyve7LObauJ5XZBCAIAgCAIAgCAIAgCA5qqkjrYDDJfI6xNtNxBHyUepp4548nJoM45HRutNOlSDA5K2iiroDDLfKSD1TY6G4Uepp46iPJyaDOKV0TrTTVTUDKVxeJ6mS4taWUuHkVrgo2wrjtuXi5VM5J7bbNlOxDdWUcdbTvglvkda9jY6G/0W2op2VEbopNCmEUjonWmmmmw1tNIXiepfwyySlw8itEFG2FbVty8XKpnJNlG2bKdxuqqSOtpnwS3yP0NjYrdUU7J43RSaFMI5FY6000UuFxUshe2adxta0kpcFppaBlO601zl4rjNklQ6RtnEncSKnGgIDlpaSOkY9sV7OcXG5vqTqo8ELIEc1m1cfeZver9YyqKaKqgfFKwOicLOaeKzmhZMxY5ExooY9zHWm6Tjp8Hp4ZWSF0sjmertZC4N8LqJFg2GN6SXqqaMaquLgbHVT3Ns3Jj3EorA0EOcApDcdsInHMYRK4MJ/7bqrXBFM7fZ3Y1xdxKbWypux78V5MK0IpyNooWmpOW/pGrwdQdLKK2mjasn/fT5GxZXZvUZUdKyjp2wxkljdBmNyO5Z08DaeNsTdCHj5Fe6046VvMDhraCKuawSF4LHZmuY4tINuaiVNIypa1HY7lx3XG2KZYtXaY0eFwUcjpGZ3SkWL3uLiRyuVjT0UVO5zmqquXaq41PZJ3vbYXQbqyjjrad8Et8jrXsbHQ3+i3VFOyojdFJoUwikdE600002GtppC8T1L+GWSUuHkVogo2wratuXi5VM5Jso2zZTuN9TSxVkDoZm5o3bwt88Ec7MnKmNDXHI6N1ppzUuFQ08wmvLLKBYOlkLiB3XUeGgihflL1d1qqm19Q+Rtm5E6iSU80HLSUkdFTMgivkZoLm5Uemp2U8bYo9CGckivdacdSkGAQBAEAQBAf/2Q==';
  function fonts(){
    if(document.getElementById('vcv-fonts')) return;
    var l = document.createElement('link'); l.id = 'vcv-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@1,700&family=Poppins:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(l);
  }
  // accept old and new profile shapes
  function norm(p){
    p = p || {};
    var list = function(a){ return (Array.isArray(a) ? a : String(a || '').split(/\n|,|;/)).map(function(x){ return String(x).trim(); }).filter(Boolean); };
    var edu = Array.isArray(p.education) ? p.education : (p.education ? [{title:p.education, detail:''}] : []);
    var certs = list(p.certifications);
    return {
      name: p.display_name || p.name || 'Caregiver',
      role: p.role || p.headline || 'Caregiver',
      location: p.location || p.city_label || '',
      certified: p.certified || (certs.length ? certs.slice(0, 2).join(', ') : ''),
      languages: list(p.languages),
      years: p.experience_years || '',
      objective: p.objective || p.bio || '',
      skills: list(p.skills && p.skills.length ? p.skills : p.specialties),
      education: edu.filter(function(e){ return e && (e.title || e.detail); }),
      experience: (Array.isArray(p.experience) ? p.experience : []).filter(function(e){ return e && (e.title || e.sub || (e.bullets || []).length); }),
      photo: p.photo || ''
    };
  }
  var ICON = {
    role: '<svg viewBox="0 0 24 24"><path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z"/></svg>',
    pin:  '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"/></svg>',
    lang: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-3a15.6 15.6 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8ZM12 4c.8 1.2 1.5 2.5 1.9 4h-3.8c.4-1.5 1.1-2.8 1.9-4ZM4.3 14a8.2 8.2 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4H4.3Zm.8 2h3a15.6 15.6 0 0 0 1.4 3.6A8 8 0 0 1 5.1 16Zm3-8h-3a8 8 0 0 1 4.3-3.6A15.6 15.6 0 0 0 8.1 8ZM12 20c-.8-1.2-1.5-2.5-1.9-4h3.8c-.4 1.5-1.1 2.8-1.9 4Zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4Zm.3 5.6c.6-1.1 1.1-2.3 1.4-3.6h3a8 8 0 0 1-4.4 3.6ZM16.3 14a16.5 16.5 0 0 0 0-4h3.4a8.2 8.2 0 0 1 0 4h-3.4Z"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="m12 2 3 6.6 7 .7-5.3 4.7 1.6 7L12 17.3 5.7 21l1.6-7L2 9.3l7-.7z"/></svg>'
  };
  function icon(k){ var svg = ICON[k].replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="' + NAVY + '" ');
    return '<img class="vcv-ic" alt="" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '">'; }
  var CSS = ''
    + '.vcv{font-family:Poppins,Arial,sans-serif;color:' + NAVY + ';-webkit-print-color-adjust:exact;print-color-adjust:exact}'
    + '.vcv *{box-sizing:border-box}'
    + '.vcv-page{position:relative;width:816px;height:1056px;background:' + NAVY + ';overflow:hidden;page-break-after:always;break-after:page}'
    + '.vcv-page:last-child{page-break-after:auto;break-after:auto}'
    + '.vcv-hello{position:absolute;left:54px;top:40px;font-family:Lora,Georgia,serif;font-style:italic;font-weight:700;font-size:38px;color:' + YELLOW + ';line-height:1}'
    + '.vcv-name{position:absolute;left:52px;top:82px;right:40px;font-weight:800;font-size:56px;line-height:1.05;color:#fff;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    + '.vcv-name.long{font-size:42px;top:92px}'
    + '.vcv-photo{position:absolute;left:62px;top:168px;width:293px;height:293px;border-radius:28px;background:#fff center/cover no-repeat;z-index:3;display:flex;align-items:center;justify-content:center;font-size:84px;font-weight:800;color:' + NAVY + '}'
    + '.vcv-info{position:absolute;left:384px;top:163px;width:374px;background:#E8EAED;border-radius:14px;padding:22px 24px;display:flex;flex-direction:column;gap:12px;font-size:16px}'
    + '.vcv-info div{display:flex;align-items:center;gap:12px;line-height:1.3}'
    + '.vcv-info .vcv-ic{width:18px;height:18px;flex-shrink:0}'
    + '.vcv-panel1{position:absolute;left:34px;right:34px;top:395px;bottom:0;background:#fff;border-radius:28px 28px 0 0;padding:94px 50px 26px;display:flex;flex-direction:column;overflow:hidden;--k:1}'
    + '.vcv-panel2{position:absolute;left:34px;right:34px;top:34px;bottom:58px;background:#fff;border-radius:0 0 28px 28px;padding:40px 50px 26px;display:flex;flex-direction:column;overflow:hidden;--k:1}'
    + '.vcv h3{margin:0 0 4px;color:' + YELLOW + ';font-weight:800;font-size:calc(19px * var(--k));letter-spacing:.2px;text-transform:uppercase}'
    + '.vcv-body{flex:0 0 auto}'
    + '.vcv-sec{margin-bottom:calc(20px * var(--k))}'
    + '.vcv p{margin:0;font-size:calc(14.5px * var(--k));line-height:1.55}'
    + '.vcv-skills{display:grid;grid-template-columns:1fr 1fr;column-gap:24px;font-size:calc(14.5px * var(--k));line-height:1.55}'
    + '.vcv-skills div:before{content:"\\2022"}'
    + '.vcv-edu b,.vcv-job b{display:block;font-weight:700;font-size:calc(14.5px * var(--k));line-height:1.4}'
    + '.vcv-edu div{margin-bottom:10px;font-size:calc(14.5px * var(--k));line-height:1.45}'
    + '.vcv-job{margin-bottom:calc(16px * var(--k))}'
    + '.vcv-job ul{margin:4px 0 0;padding-left:26px;font-size:calc(14.5px * var(--k));line-height:1.55}'
    + '.vcv-logo{margin-top:auto;padding-top:18px;flex:0 0 auto;width:100%;text-align:center}'
    + '.vcv-logo img{width:130px;height:auto;display:block;margin:0 auto}'
    + '.vcv-foot{position:absolute;left:0;right:0;bottom:20px;text-align:center;font-size:10px;letter-spacing:.25em;color:rgba(255,255,255,.55)}';
  function css(){ return '<style>' + CSS + '</style>'; }
  function ini(n){ return String(n || '?').trim().split(/\s+/).map(function(w){ return w[0]; }).slice(0, 2).join('').toUpperCase(); }
  function first(n){ return String(n || '').trim().split(/\s+/)[0] || 'Caregiver'; }
  function html(p0){
    fonts();
    var p = norm(p0), nm = first(p.name);
    var info = [];
    info.push('<div>' + icon('role') + '<span>Role: ' + esc(p.role) + '</span></div>');
    if(p.location) info.push('<div>' + icon('pin') + '<span>Location: ' + esc(p.location) + '</span></div>');
    if(p.certified) info.push('<div>' + icon('plus') + '<span>Certified: ' + esc(p.certified) + '</span></div>');
    if(p.years) info.push('<div>' + icon('star') + '<span>Experience: ' + esc(p.years) + '+ years</span></div>');
    if(p.languages.length) info.push('<div>' + icon('lang') + '<span>Languages: ' + esc(p.languages.join(', ')) + '</span></div>');
    var skills = p.skills.length ? '<div class="vcv-sec"><h3>Skills</h3><div class="vcv-skills">' + p.skills.map(function(s){ return '<div>' + esc(s) + '</div>'; }).join('') + '</div></div>' : '';
    var edu = p.education.length ? '<div class="vcv-sec vcv-edu"><h3>Educational background</h3>' + p.education.map(function(e){ return '<div><b>' + esc(e.title) + '</b>' + esc(e.detail || '') + '</div>'; }).join('') + '</div>' : '';
    var exp = p.experience.length ? '<div class="vcv-sec"><h3>Professional experience</h3>' + p.experience.map(function(e){
        return '<div class="vcv-job"><b>' + esc(e.title) + '</b>' + (e.sub ? '<b>' + esc(e.sub) + '</b>' : '') + ((e.bullets || []).length ? '<ul>' + e.bullets.map(function(b){ return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' : '') + '</div>'; }).join('') + '</div>' : '';
    var logo = '<div class="vcv-logo"><img src="' + LOGO + '" alt="Valeo"></div>';
    // page 1: header, photo, info, objective, skills, education. Experience goes on page 2.
    var page1 = '<div class="vcv-page vcv-p1"><div class="vcv-hello">Hello, I’m</div><div class="vcv-name' + (nm.length > 11 ? ' long' : '') + '">' + esc(nm) + '</div>'
      + '<div class="vcv-photo"' + (p.photo ? ' style="background-image:url(\'' + esc(p.photo) + '\')"' : '') + '>' + (p.photo ? '' : esc(ini(p.name))) + '</div>'
      + '<div class="vcv-info">' + info.join('') + '</div>'
      + '<div class="vcv-panel1"><div class="vcv-body">' + (p.objective ? '<div class="vcv-sec"><h3>Objective</h3><p>' + esc(p.objective) + '</p></div>' : '') + skills + edu + '</div>' + (exp ? '' : logo) + '</div></div>';
    var page2 = exp ? '<div class="vcv-page vcv-p2"><div class="vcv-panel2"><div class="vcv-body">' + exp + '</div>' + logo + '</div></div>' : '';
    return '<div class="vcv">' + css() + page1 + page2 + '</div>';
  }
  function load(src){ return new Promise(function(res, rej){ var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = function(){ rej(new Error('could not load the PDF maker')); }; document.head.appendChild(s); }); }
  async function download(p0, filename){
    var p = norm(p0);
    if(!window.html2pdf) await load('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:-10000px;top:0;width:816px;background:#fff;z-index:-1';
    box.innerHTML = html(p0);
    [].forEach.call(box.querySelectorAll('.vcv-page'), function(pg){ pg.style.height = '1055px'; pg.style.pageBreakAfter = 'auto'; pg.style.breakAfter = 'auto'; });
    document.body.appendChild(box);
    try{
      if(document.fonts && document.fonts.ready) await document.fonts.ready;
      fit(box);
      [].forEach.call(box.querySelectorAll('.vcv-page'), function(pg){ pg.style.height = '1055px'; pg.style.pageBreakAfter = 'auto'; pg.style.breakAfter = 'auto'; });
      await Promise.all([].map.call(box.querySelectorAll('img'), function(im){ return im.complete ? 0 : new Promise(function(r){ im.onload = im.onerror = r; }); }));
      await window.html2pdf().set({
        margin: 0, filename: filename || ('Valeo_CV_' + String(p.name).replace(/[^A-Za-z0-9]+/g, '_') + '.pdf'),
        image: {type:'jpeg', quality:0.95}, html2canvas: {scale:2, useCORS:true, backgroundColor:NAVY},
        jsPDF: {unit:'px', format:[816, 1056], orientation:'portrait', hotfixes:['px_scaling']},
        pagebreak: {mode:['css'], before:'.vcv-p2'}
      }).from(box.firstChild).save();
    } finally { box.remove(); }
  }
  // call after the CV is in the page: shrinks a panel's text until it and the logo fit
  function over(pn){ var b = pn.querySelector('.vcv-body'), l = pn.querySelector('.vcv-logo'), cs = getComputedStyle(pn);
    var room = pn.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    return (b ? b.offsetHeight : 0) + (l ? l.offsetHeight : 0) > room + 1; }
  function shrink(pn, min){ var k = 1; pn.style.setProperty('--k', 1); while(over(pn) && k > min){ k = Math.round((k - 0.03) * 100) / 100; pn.style.setProperty('--k', k); } return !over(pn); }
  function fit(root){
    root = root || document;
    [].forEach.call(root.querySelectorAll('.vcv'), function(cv){
      var p1 = cv.querySelector('.vcv-panel1');
      if(p1 && !shrink(p1, 0.82)){
        // page 1 is full: move the last sections (education first) and the logo to page 2
        var p2 = cv.querySelector('.vcv-panel2');
        if(!p2){ var pg = document.createElement('div'); pg.className = 'vcv-page vcv-p2'; pg.innerHTML = '<div class="vcv-panel2"><div class="vcv-body"></div></div>'; cv.appendChild(pg); p2 = pg.firstChild; }
        var b2 = p2.querySelector('.vcv-body'), lg = p1.querySelector('.vcv-logo');
        if(lg && !p2.querySelector('.vcv-logo')) p2.appendChild(lg); else if(lg) lg.remove();
        var secs = p1.querySelectorAll('.vcv-body > .vcv-sec'), i = secs.length - 1, moved = [];
        while(i > 0 && !shrink(p1, 0.82)){ moved.unshift(secs[i]); secs[i].remove(); i--; }
        moved.reverse().forEach(function(sec){ b2.insertBefore(sec, b2.firstChild); });
        shrink(p1, 0.7);
      }
      var q = cv.querySelector('.vcv-panel2'); if(q) shrink(q, 0.7);
    });
  }
  window.valeoCV = {html:html, download:download, norm:norm, fit:fit};
})();
