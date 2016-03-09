#PysakkiOpas Styleguide
Okei t‰s on lyheysti v‰h‰n et miten t‰‰ pysyy siistin‰.

##Git commits
Kantsii kirjoittaa imperatiivis. Esim. "Fix bug with map view". Yleens‰ k‰ytet‰‰n termej‰ "Add" tai "Create" jos lis‰t‰‰n joku toiminto, "Fix" jos korjataan, "Enhance" jos parannellaan ja niin ees p‰in. Kunhan on imperatiivis ja commit kertoo mit‰ tekee.

Myˆskin kannattaa k‰ytt‰‰ "git commit" -komentoa "git comment -m 'viest'" sijaan. N‰in voi pit‰‰ otsikon lyhyen‰ ja jaarittelut kirjoittaa sitten sinne bodyyn.

##CSS
Yleens‰ ei tyylej‰ lis‰t‰ id:n mukaan vaan aina luokkaan. Eli ei "#elementti" vaan ".elementti". Ja pitki‰ puita ei kannata k‰ytt‰‰ esim. ".elementti .toinen-elementti button .nappula1". Mieluusti vaan pelkk‰ ".nappula1".

##Sisennys
Kaiketi k‰ytet‰‰n 4 speissi‰ eli tabin verran. Yleens‰ tabi on konfattu tuottamaan 4 speissi‰ mutta jos ei niin n‰kee sit GitHubista kuinka p‰in vittua ne sisennykset sit onkaan.

##DOM
Suora manipulointi document.getElementById("el").innerHTML tapaan on tosi paha. Yleens‰ Angular osaa tehd‰ sen automaattisesti $scopen avulla. Jos ihan pakko niin sitten luo oma direktiivi sille jonka sis‰‰n sen laitat.

##Angular
Aina kannattaa k‰ytt‰‰ angularin omia termej‰ kuten $http http-pyyntˆihin jne. Helpottaa kaikessa.

Ja jos on jotain viel‰ niin t‰nne kannattaa lis‰t‰ ett‰ muistaa sitten myˆhemmin ett‰ mit‰ on mennyt lupaamaan.