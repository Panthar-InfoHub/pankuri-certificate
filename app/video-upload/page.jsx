import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import UploadVideoDialog from '@/components/upload-video-dialog'
import { videoColumns } from '@/components/video-upload/column'
import { DataTable } from '@/components/video-upload/data-table'
import { Plus } from 'lucide-react'

const page = () => {

    const dummyData = [
        {
            _id: "1",
            title: "Getting Started with React",
            thumbnailUrl: "/data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAKgAtAMBIgACEQEDEQH/xAAcAAACAwEBAQEAAAAAAAAAAAAEBQIDBgABBwj/xABEEAABAwMCAwUFBgMGBQQDAAABAgMRAAQhEjEFQVETImFxgQYykaHwBxRCscHRI+HxFSRSYnKyM0NTgsIlZHSDNDVE/8QAGgEAAwEBAQEAAAAAAAAAAAAAAQIDBAAFBv/EACkRAAICAQQCAgEDBQAAAAAAAAABAhEDBBIhMRNBIlEyFHGRBSNhgaH/2gAMAwEAAhEDEQA/AM1ZXT6gkXLCklUwsDB8+lHJGrJj1qDa0klMp1DEA7fOibVIW7n8KVK9Qkn9K+ni6RjAbiwYfBC20ifxRQ39jW421ztg01hW595Rmg7u3uNWu1c0dUnM+VJOMato5N/YGrg7aMoUVD3YV+E8o5VW0Vt3CGQhxxxIASHBOkidjPXM4AjMiiS3eW7ziVK7QtiVd4YxnHnH0RRds6l1akqKEkJKk6tzH4f6xWWSg+iqtBPs9aWiloF80s9qSEpRMKxiQRsDOxJnlgUS00VL/hds5bJBiCpGogbjmJkDY9JiBVVi8ytaXVpbUBlJIIGJODAPInu/GaYXd1ZPtNusOhDq3DKAkoHUZmDvPXcbQag1zwVjRHsuzZbLrSewKdQeKIXMQCdUTz6ctpoK9fASP4name6uFjfO08oPPz3odN+rSUMqKUqRJTgTO/hHMx8siotBbgClDQlZgd05IHX84rVjw+2FQlJ8DK3u0O3E3C9Cl7qCAEiDOw6zyxmjGH7MoUptxTiEqABS2ZJOxgdSDVVrwu3umFOnUEoE9mGxokDaZzB3BEx5VpOEcAe4gCh1At7VCgoEJSFnlBIAJG+/U0+9Y/2DlxYscfl2U8Ns2uJuK+6NrcKBCu4YHgTG/hTViwVb5W0pPpTxT1lwexLTKA02PdgTqPWspxXj7z6Oysx/EjunfNShky5nUejPgwTz5EsY4Ve2tq0pxSAgc1HdVIb3j13dqDfDLZREwpzSQBQS7N1Vwh994q0glJWoH5UYi/7yUdiVxiZgVojgjDns0rRx0q35GiFo0rt1m4XqKhtTS2TcNFEHuTG86apYQhSlLNvoPnvRC+I21s2lLs6lYAGfnSZJX6Mmo/qWBLZAkbZ5xSllyRG2w360L2TmpztnS2lXQ7igLvjZcnSgIEYJ3pZ9+cU8XVayDOlIJgUscUjx5Z8k38EPbx+2YaShrU7oTAjEfKlz18yloqQVlatgVjTEZzFLLi4uHEgKyNtMZ670v4ndqZtuzKh3dknkefj8f0pvHXZaMM0l2N2uPXbSAi2Uz2Y/xCP0NdWH7cEkkqJrqFIutJ9yDLYN3rzawlSU69QcPlEbzy6Vo7Gym5aQowHSWlKnbUCmfSZqm34fb27SUtBASsZJO8/ypuwwwGUpbiEpgQaNuuS0pL0Ze8vBZOm2cYUHU7gbDlk+f6UTYPt3bQcQNM75G/1+lOuLcEY4wXOIJ1G5QALhIPQ/8QDxxPQjxpHb8GvWFlbbgC0ggaDgiPE/Ub0qyMbsu+5By4B7NeqBpWnGk5kERmR448ZqbfDEkEd5ONJ0kjA5fypyyzcWjLalPNLU4iFJbXMf6gQI22/Y1NtsGY3O9CNN2wOTQub4fpBU201qAKAiMFJx8YoTiVo4tBWnCUkK0wAOYMYxua0Qb0iavuOGhbGpQBEZkSKDST4Ojld8mBQy4FNqZwUDDkiJnfpEc9utOLPhwuv+aglcHUlM5x3ScSYI2B3HKirThTzfEgWm9X4nHA2SlBnbB6eI2raWVhbcMtPv/EyhtKU4BiD0xHj55qksmxG2epjjh8VyQ4H7PMto13adLaVDSAowYwJnoNqjxz2ttLRz7rbaVaTB08qyvH/a674ovseHEtMTCSPeP8qEtbYNAOXa1glUpSk5n/KPQfKuhpXL55f4I48HlW/M6iMLp644u+lTjjkSTBVAQZwMYOOfOasDIbV2LaVOuEwQgTRSGEtWaFvuJtGx7wIAWc/yqxtxbja3uF28oEanijfPLrTeVQ4QH/WfD/b00OPs5uzU2sO3TiUoKYKQZ+dVP8StbcFNojtVDmkgAeBPXwpev+I8hdzdLW6kElCsJTj8/Sq27jSgW6FQoKI7NakYEDmdwT4CYoOTfZ5eaeo1LubLlvXt4lQdcLbUSWwIwfzrnFNIZbKlFPZjvARqjeRigHri5U9h7DajoUCFE+k+Ex8+tb6g2wtplXaKJ/4hytIIGBPIynn1G24cl6BDSU+SxT7CfdSFAAE6jHr4/vQN3d/xChhY7ONIVMgR09fz8aHMuKAW44C1IUE5wJHLbeMzz60JdvNsFQbWpZJ97IJGflnbwp/IjbHDFBr3EV2mt5pxaHpgN4AAPP8ApSC9v37x5brji1rO5jb514dT61BYJkGABvQam+8kNpVqMZTkT0NQlMukl0RU4tJhSwD0MV5R7fA7h0FalpBJ2/pXtSsIQm8eSylKHnBMQEqwgdB8qMsOL3LB7MupVGdIEg+H70ttSEHS5rE97AnI50Swyt+6QywlT651YTv5D0FaoxBKvY9Xx+7trhK7BSVOIEh0JI8IAO+8Zwaa2t21xFxJ7Rq0uFSNGk9g5y1CfczAg4nArO3XBbthZhotxBBMpwdvGT5/vTO2tUkpUZSUwCVkAFUAyT1JIz09aSaj2hoqI2vXbqzQhN1bqQtYISr3kqMTgiQRykfLevbR14q03CUpMTuO7gYnr8djRLNw7bWqy1cNobZIQWFDuFJ5wMcyTO81zrzNxqQu3CFCM25Jk5A/hqnO8RHLaob5Fo6eGQvadYKTqWmBtyq4XrjZKGiFpHNY/XnVKOEG9uNNrepW4AJQv+G5IzsRBP79Kb3VrZcGQO0ZceulxoQmSMnA+RydhJ2ppZI1T7MWWMYSqHIGy8W7gOBKEEH3SJE7UFxlh/i7n98cKm0AaEJBAHiPGOtUXly43cOu3Sgq4cMhCPcbAkZP14UIvibTPeFyFvJTIbUTpM4AAx4fnVUlxKiUpLH+5JHC27VKU2zaWgDJdV9ZNMOFWRSQ/wBktoKOX7iQtefwpOY9IrPt8evEuj3H0EZMQQZzEdB5+dW3nEeIPhCgm4twU6kqAnUCcbkY3PptzppuUlVgm55+Jt19DLi1t92eceDzL7JgJNw8G9IgzvknI2+HQO39pH2uFO2v3hELR3AlEpVz3iZkGZGQB1pQlhFwta725cUraEglS5xHeMxy8NRB3ijSzY9p/fe3LplY7RpRJBxOQTvPwOwqThHpjxjHGeM8QQq5UVPl14+86yjRAIJkkxJBIzgADpmqLyzekuBTbilp1FCchMnnBifqadcLseGW7a02y9QO5U5Pn0ET0wfhVPELhDrqmlHtEgkySSmSDJwdzzJz6V3K6CskbEQV2LYgSVmVKQI0pMdfHPwzvXOPhXvIV3wQtI5keUY5ZB50SltbDyFKTqO6ULzqiZPyifoc5eW7bIRpAgQP3/I/GjaOTtkitFvaI7ErBSn+InUEnT4HrlU/UJLpDr6ybe2cJkSQjCYAz+fp8KId4gQFdm2gFHvKyRHPw/lVauIXF+52TF4ttsJkNIWEpJP+FJIkY/KpbqZRWK9DiXUoA70gEae8OoA8qMb4FeaCt9SLRqASt9fwxyxj1qziDC+HNquGb63ceQ84yVMvJC9SSmTOolXvbbxBO1Z+6unbm4K37grzAK8kc/2pN1j8mhCuFMpSh69deXHvtI7vpXVmHHGu7oJbMd4GFCZO0nAiBz29B1cdtZprZk9klMtqQgyVJ0qjHn5/CmfAb1ywuNbTDKlRAURpOfL9fDxqvSAA3oCN5KyoDB2HXMflVjtz91UptThUqT2gSVZjEgeWOvlXovqgySkqGV4tl9xSwpsORk7nM8uefPahLjiVo0dawsOqPdaKdSUzOoDof38qDcDr7Za7ZzQnSohKvh+/wipNWTY7ygSpSpxsRkz4mam0qHxYqfLoatXry32125QpSgqFuEGcRnUMzBx+1MLBb/EL9u3tGAVail9YIIxz8OZnzoSy4eu6umrKzaU2tYClqMkJHIYJgxjFaVlCLFhfD+EFKUwfvN6TgHmEn9anLbD/ACyOq1af9rD0u39krl4cN1WHA0hd6tP8S5X7jedvjypEvjzvC0LZtbt3SnJWpUqfUdzBwBt6D4+XnEbezs3GmAWUKKkJVACnFD3lGT4x6z4Vj7y+1OqKUJOkwUqkyfXJO5k0MeFPmXJmVrjH/Jple2rpaNu+yrvYC7V0oKf+1Up/KgF2PDuIrOnj6WiTrUi7AbzMZI7s55Hx8s7JQsOulUqMg797kJ60OqHlKU3zASpSiCRPMic/y9KLjGP48GmMFXPLPoCuDcL4Uxbp4k2oOrmbhSobUeXe2jbY5oS74Ot11C+Fdghs+8sqIUPXn1670k4Lx57gi0vWVysajpdZKtWuJyBGw2if56Fn2+t7hITdcIzGHGXNBPpEfKkW9P7Fmq/HgM/sRhxATdvOOOAAa1d0pAAGAOWBj+dVjhlqgFly6cQlEqgpIgTvM+PnnpQzl9c8QdJ4XdtEkDRbrAbd8jqlKsdDQjz7jTpPEGHfvA7yELRpKeeTvy8ORp9tkXGfsbLZtUWTire77dKZ0EAYOZJJGfj1qhixXcaez0IKTqbI0kRMgAfvvAoE3oIP3dLSUAp1aR7md53Hx/KqP7QUSSlZGqZIj4z8/wAq7xslVPgjdNBorU4O+2o5UR6Y+hSa5cBgQCrYgfXhRj10VJPZrCSc5GRy6UsWtbKVp1nQvcbE/RpnCisLKHczlA8DE+U1dwC7RY8Vt37krCW3WyoJWQNOoaiYMmBnSN4ig1lJMgKJ8f3ojhluh/7wCW0uBsBPaYS2Coalkc9Ikx65qE1waIlXEb5u44f2S3e1fS8lSDqdOlJSoLypR5hvx+ZpOo0+v1Iure+uV26LdtbgNiA0EK973cbp0TJyAoJiJikhbJwZmeVTS4KWVTXUwatLYJ/vNz2a590HYV1dR1mpS6m/ebbRoRqWDlUaj6fyrziFoW7hIUvt0uJlS8BXj4iYrxy0XbvlsIX2iU6lAYxA5jbf5+dUXqWtQUX3HnTuZkHHU8p/r09F8IOLHul3wXWts6FNqQUpkGFKWDnp4E+HhTjhxcutDLQJCsJBz1gx1ggUktXFrQUIAHKREz58q19mweH2vZoURdlOp5xRj7ugj/ceQ8fGla2rdL/RLV6h14Yew9Df3O2NnZPBoxN5c845pSR44+VJOJ8VDik2duoJZR3UtJM6iDGTz5eGRHiBxbjQ71uw440lnupQoyVciSQN+XyoHhD2hbt066O4kqUognJx06kVOMKe6RkxYb76POLXZeuilKh2duC0T+E9cec+kdKVtrS43CG3HCkfxEo1E7mDjwx9ZlxB1agSHUK1SojsymT1mgjdOthBZdWhwDJbVhU/ljSIz+LO1CU/o2JV0EPWN+4Q6LR3s9kkI1Aefr1qDVtf9m68hKkd060qxg7gDxqxPHuKIgJuZA6oT88VYvjfEXAApxCZ/wACACam3Zz3BHD2uF2Sf/UrO6duB7wc7iEfA59Zqdz91VeNpsGEobKgBpcVpPjqVt8o3papx18y8suTvrMx9eNXW6R2a8krxpg4AmrwoVpByQtxSg2s91OSMwJj0G30aaMXj6GENXZbubdI1Bt86tM4wrdPoaXWiXOzGvSjbUnlHj86tuFIdKWxq3zAO39f1qr2tEtzX4hxTa3yC3Y6e2IkM3Czz/wKEA89435mk12lxp9faa0qT3SF4VjkR8KLubRLbEgpGfxGKmxd2jzYRxJ1ZSmAh1I/isidtR95PhOOUVNfEpGEaE5c1GJiqHefen5Gj7mycZdJUUqSoam3EklKx1B6byMdOooe/cLzq1qS2lSt9CQJ9OW1EO2mAK3ycb1bYWjVxcNi5c0WiVAvLO6U8/NRyAPHOKmzbuPrDaVpRqByqY28ATTRi0/s0NXqXW1OMOBagloE6ARkHPPEkA7bTFRnRThCvjFq3a3AZC1l8SHm1qCuxM4TqBMmN+QnzhapEnn6Vt2uEv8AELJabpTzTbzyHUKeuO191K5AAGPf513DvZWF6rt3ShPupQZKvE9KRLgSU0jLNcE4i6gLRbOKSdiK6vpjaWmEBtEICRsK6hQnkYjdQ81b9mtmG0qJGlAAKoPMROOu8UrdtldomAAmTgxsPyzT7iC2LgNa3nXVFMqLqgMzECE8s/HbraxYsqcdWQUstgBSkkpStXgFbnfP9K2x+5BlqFiVFHArNNoyi9eSO0Ji2QQMkH31eAjbrQnHuL9qjsLaZSpRcU5u4cZ9Mjwk1LiDklTSVEq26HaY8tvPpSN4w4Fp2JKU6TH1yppxTdshBXywK41IdLbiZU3I0qM/XP50epYZ4SUn/nLgAiD3RufVQ+ApWVqXJ1RCj3Zkif6D4CjuIKCWrVBiCjVgdTvHwqEmaodC24dnYgDWZhW4jHKceJ8gOcWWu0WBpUowcE84x6Y/Kr06dSY7OfEwKZts6mVrW6kqjCYyOW36nG+/OckDdQrFr2chaskYTnf65b1cywlSUJiVkxFMLeyKilLbQUArOoZn9Nv6Ua1w9ttbitKStJBUmDjr3d+W2/IxQ6JvIK0Wi1p1e6nY6iQRgijk27Nt2TiW1TH4dU5gAHkB+/rTJ0nshoUVFI0kj8InHgMnpPOq9SWVqVqU4sxmICVcyNvH50eSe/ceIUlw6oIGjuEq6bAYj+vXZc6q6ZUrKkAiZTgZj9xvRiTq1rlCVCCAAJG3KevTodooe6Ku0OtMqTiZ/mM7cqeD5Kxil0AOqW4dTq1LVMgk7Zr1pP8AFiJ5V4owTiI5/X1tXqHltKEGQaryVNCzw64TaNW9yjRb3HeYWcBCus9Dsr0P4RSG+aYadKC92jiZ1SMA9PT63qd3xG7uW0NrdUpKe6lKlVG9Q28u5ebWCFLJk887+u/rU6kgerZVwpxIvmlPPLDYC5JWEfhOATgTt61oOE2JSq+ffTpeUJHaKkq/iJOPUA+k1muEpLt+0hIWsjUQkAFRhJOJIz6/HauuGy7drTatLSEmFJ5jkdRk+uYqU1cqC+jWcV4ibKyQ2L+3W4FqUppogFSToA2EHM4350oZ9onrR1aXlofSUpUkpPuSNiRmfDwpcUIa4a6C12vfI7UBPdPdOcTsMQfxGlS9PJMUqVC7Ux/de1z6nSWbRCk8ytRknyBx8/OurNkZr2uDsRv7FrtVj/iEAkl0pALcbkgfl6VffcQZbYbabaCWwCEgnIA5nxPXz8KGvOIptmDZt987uKC5lfQGdgPiZpCu5UrWT+MbbbY/St9LtmJRcpWyT9yFrXpJ8DsZ5c/qaAdJdA7wMbQPrxzRGnSQqZx8KiRG056UJMqnQKGiVAD3uVMuJMErt5QSexGRjbH5iut7Nb2j3pnn6/DnTm+ct7rh9nbotnU3FqgpW7GNM4j4/wA6hK7RVTWx8iK3t2yNakdnHekTJ+pFH26dOnQlIUrdIKY5HPX8qipaSoIQj8Pdk4A+PrV6GVhStSoRuAnv5jffrGedc1ZJ22X6nBKdAXpVM6taRsDIjy3/AGqIPfI15I9/V5k+PXPOfOvWLdbiFKSNfJKymD6fLx8K9NvpblxcL1ZER4b/AF8qCic02TuXm7X+8XpDbfvKUQE7z/Tx2pAv2k4YWnVJdWtaSToKCCroBOPlSv2tTfPLb7qlW6U4AJIk8yOR3FILRsLJ1iU6TB1aQM/OsuTJJOi0MSo2Njx+3u19klC2XFAnSYKTERG+Yn4Hyq1w4V3pmsvwYJTxK3He06j7ozsa0wAMgiTyFaNP8lbGaSZFeYH+DofyqPd/Bq8Zo1fD3W0hd2r7uk7B4nWfJO8eMAVQtTbeGEEn/qLA1H05fPz5VoQQRZqs1dpJmNjvXBsfiEiuaA2WcISDxFpJWEA6hqIMZSehB+dS4i6e0dbRCUdooqgxqMn1qgqAwlMCqlnfE1Fx+VgbLlf/AKgf/J6/5aAO+00cpSBw7TrlSntWnTtjeSP1oWDy3paCQ+7OHMx4V1TMc966hRw2ISpKklSRHIjaNuXPlU22AtIg5MyFKiSJ6+FGvWCm3FJCgrSRpIMgDfy5/nii7OzW6kNoRtkmfjyz0q7fsztr0KzbJbCCrvFYneQB9fXSRfUUpbS0hMf4E5+s1p0cFDqQp4DXzJgaht8see/LA1xwINyo+/voOMdd9s0qyRsShbasnsi4jUhYGkHzGT9eHqWpha7dIE6RJ7x3PkRTGysjbATIQOQUZVzHPbc0wcs2HGyp0gSIAJJP50NyXIknRkAz2OYWVJjBAIODP1y60S1rS5C0KWEpyJ0pT05/Ln1ptdWSmFw0tIQANjGaFRbFKolICt0pINNVjxkyDKnAcp7MBOExE+Ph8+WdqAvXT/y9/KaY3ikgafCsrxDj9hbOKSpxbq04IaTJHrMdedOtuNXIqrYD7Tdqu3ZRI7AuEkRlRAESemdqzq9aYQ1pUjlHIivbzib97fdoZIUQENnPl6/XjRN+2/ZhLN0jQ82Ybj3Skkknz2HoK83JJTk2jTFVwz3g4T99b7UiJOuT7mMKrWoulW5/ui1IMZdSIUf1E+HrWa4fwt28CnLZRcKUpXqRkJMDB9T8q0aGnClGtBkyPCedatIrTRKU1ZUqSoqUZUrc8zXkTUwBJlMEVEjNbKF3Nna9IiqljVmpkV5QaDZSU1AirjvUFUjQSSnU/cSz+PtdXu8tMb0IasVUFbVJnFZ3r2urqUY+xW3AGnUhStae6NWtOSeoPT+dOLLgTEqBQjJHp5Zpja2raAFqXJH4enpRKWhqlIn1rzJ6ib9ko40gB+0YZaLbaYSQJ/SlTvD0FvuJRKc6iCSfnHLpWhct1EyTP6VSu2xtNCGRo6UfZmzbqQZ1nu4wmRVQadWrSe6g4T3d+n1+9O37YTlMCg3W0oBitUG5GNzpgNyBA1CVAQTvWN9ofaGw4O403dKUXHDlCIKkDqecVr7lyJETWMHspwv7w/dXaTe3Di1KW5cLnfkEiBj65VpSml8f+jwlF8yLkvsXrCX2HUutrGCk7j4/LfwrEe11i01xJKULkvDtVo5JJn89/j4Uz4/Z2HCwp/hHF0W9wyjNqLgQpIkgDMzk4M1m0rueNX+lCg/dXBAA2kxHpj5A1PNlco7fZqxRr5LolwDh9w5xezdSw64wHe8oNnSI/wA0Ud7dLSb61YAlwNqUqDyJECf+0/Gt/Z8PbsbNi1bOpLSAkEfiPXzJ386+V8Xu/v3GLy7TlBXDf+kYT8hS5IrHiUfsMJ75t/RtPs+tAnhT7i0wlx06TOFAAT8xFML9KC4Q3sN+npRltY/drRi1QmEMoCfM8z6kmouW9b8S2wSMt3NsUKaqBbpmpiq1MU9lNwtLdQLcUyLNQLNBsfcLVIqtSKZlia8NtNIw70KVIqpSacKtYody3ipsKkKyM17RhYzXVMbcfoFLTiAlRVM1elxSUxE0CzfsvGWnm3B1SoH8qv7Sc15Wx+zH+pSCQ8rmmKqcOozVSncVStc4oxgSnqbOfUpQOgZFKnWFuE60xTidqgpKVGavCW0zSmZridvcs2Fw5Y26bi5SglppRgKVyBOKxth9m1q6Xrnjzy3719ZccS0rQ2lRMkDEnPOvqTjSYxUFMJWQUmIqjmpcsaGplBUjAtfZ37PN/wD8Ti4/9w5+9OWOC2tk221a2rTSGU6UBKfdByQD571p0MICSCJPWu+7I50VkSA9RN9uzMP26WmnHFp7qElR8gJr4AhILOqI15Jr9I+1TaGfZviTqDC/u60JPRShpHzNfHeGey5veHcYue0CTw1LSxmAtB1FfyHxFLmyeRqjbpcijFt+z6fwWw/tDgNjdqSpLjjCVKHNJgSPjNQesWkoI72sbTUPs14sm74I7ZqKtdorrPdXJ/PVWjVbNFA/hgqCTkVbHmkuzHKbjNoyDtnBmhl20GtK80BhIg9KC7BKlELrXvtFo5BEq3qJYp0u0GrAkV5910d4JhCtqXcU3ipFnq5TVqbD/LFMW0xIppZ2f3hkrRsneu3pK2JPI0Ztdh3TSy6ttJIrT3ShsnyNKn2taq6UlXA0J+xAq3zXU3NtmvahyV8h8Z0o5QD4CKuF5cojsbh9Gn/C6R+Rrq6vKPRaTCU8b4qmQjid4nVnuvrn86va9qPaBggt8b4gI5G5WfzNdXV10TaXVB9v7f8AtSyRp4zcKA5LCFfmDRiPtO9q0LP/AKihXgu3bP8A4iurqKkxXixvuKCUfax7SpEL+4ueJtz+iqvb+17jyPfteHK/+tY/866uoqTGWmxSXMQlH2xcVGV8MtFf6VqH71M/bJxEgj+ybcY/6yv2rq6u3sX9Hhv8RR7Q/aVxLjlgm0VatW7IVqVoWT2kbDI2mD50rsPbC7seH8Ss27dtab9tLa1LKhCQCMAR1POurqHklY/6fHHhIN9jPbJr2cfvXLph+5+8hsBSVCU6dU/7q1yPtY4YE/8A4nEEg7gJQf8Ayrq6qrLInk02OUraKh9p/CHFaTZXwSNlFKJHpqopn299m3YLl480ZE6rdZI+AIrq6qeeaF/S4yT3t37MhRDN+4oTiLZfx2qp37QvZ9OA7eL8rf8Ac11dR88wPTY0wVX2kcDSrFrfrHXs0Af7qk79q1i02UW3DrsEjIUpCQfzrq6pyzTCtNjfoSXH2lvLP8LhSEz/AI7gqn4JFLn/ALQOLOSGmLJr/S2on/dXV1Teaf2WWDGukAr9seOKVP3vT4JaTHzFdXV1J5p/Y3ih9H//2Q==",
            videoUrl: "https://dn710303.ca.archive.org/0/items/YourNameKimi.No.Na.Wa.2016Videoclip3/Your%20Name_Kimi.No.Na.Wa.2016_Videoclip3.mp4",
            duration: 1245,
            quality: "1080p",
            views: 15420,
            uploadedAt: new Date("2024-01-15"),
        },
        {
            _id: "2",
            title: "Advanced TypeScript Patterns",
            thumbnailUrl: "/typescript-logo.png",
            videoUrl: "https://example.com/video2.mp4",
            duration: 2156,
            quality: "720p",
            views: 8932,
            uploadedAt: new Date("2024-01-20"),
        },
        {
            _id: "3",
            title: "Next.js 15 Features",
            thumbnailUrl: "/nextjs-logo.png",
            videoUrl: "https://example.com/video3.mp4",
            duration: 1823,
            quality: "1080p",
            views: 22105,
            uploadedAt: new Date("2024-02-01"),
        },
    ]

    return (
        <main className="min-h-screen p-4 sm:p-6 md:p-8 mt-24 ">
            <div className="container mx-auto max-w-7xl space-y-6">

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Video <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Library</span>
                        </h1>
                        <p className="text-muted-foreground">Manage and organize your video content</p>
                    </div>
                    <UploadVideoDialog>
                        <Button variant="gradient">
                            <Plus className="w-4 h-4 mr-2" />
                            Upload Video
                        </Button>
                    </UploadVideoDialog>
                </div>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Videos</CardTitle>
                        <CardDescription>Manage your video library</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={videoColumns}
                            data={dummyData}
                            pagination={{ currentPage: 1, totalPages: 1 }}
                        />
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}

export default page