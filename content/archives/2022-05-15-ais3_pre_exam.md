---
title: AIS3 pre-exam
date: 2022-05-15
draft: false
categories:
  - Contest Review
sitemap:
  priority: 0.8
---

因為暑假沒有空參加 AIS3，今年抱持著玩玩的心態在打 pre exam。中間同時卡到 GCJ round 2 和 HP codewar 所以不是所有時間都在解題，不過也因為是抱持娛樂心態就將大部分時間都奉獻給了 Crypto，最後成功解出兩題解題人數偏少的題目，也算是頗有成就感。

以下是應 AIS3 要求寫的 Writeup，就順便放上來了xd

## SC

簡單的凱薩加密，寫個 script 好好轉換即可得到 flag。搶到首殺><

```bash
AIS3{s0lving_sub5t1tuti0n_ciph3r_wi7h_kn0wn_p14int3xt_4ttack}
```

## Fast Cipher

梗在於用了超級大的數字最後卻只需要 mod 256，因此只要枚舉 0-255 找到正確的起始 key 即可。再次搶到首殺><

```bash
AIS3{not_every_bits_are_used_lol}
```

## gift in the dream

看到這題選擇直接上網搜尋 ```gif ctf```，發現可能會跟時間間隔有關於是就利用以下指令拿到 gif 圖檔之間的時間間隔，最後將 ASCII 轉換為 char 就成功拿到 flag。

```bash
identify -format "%s %T \n" gift_in_the_dream.gif
```

```bash
AIS3{5T3gn0gR4pHy_c4N_b3_fUn_s0m37iMe}
```

## SAAS Crash

其實隨意嘗試後就不小心拿到 flag 了xd 又仔細研究了一下後猜測應該是跟改變字串長度導致 RE 有關。

```bash
AIS3{congrats_on_crashing_my_editor!_but_can_you_get_shell_from_it?}
```

## Poking Bear

首先要知道 secret bear 的 id，那當然是對所有 id 都發 post request 看看了。

知道 id 後點進去被告知自己是 human 而非 bear poker，繞了好大一圈最後發現是在 cookie 的地方自己被標示為 human，改成 bear poker 後就成功拿到 flag。

```bash
AIS3{y0u_P0l<3_7h3_Bear_H@rdLy><}
```

## Time Management

因為 ```./char``` 執行後都不會有反應，猜測是內部有呼叫 ```sleep()``` 函數，因此嘗試將它覆寫掉即可獲得 flag。

```bash
echo 'void sleep(int ms) {} ' > lib.c && gcc -shared lib.c -o lib.so && LD_PRELOAD='./lib.so' ./chal
```

```bash
AIS3{You_are_the_master_of_time_management!!!!!}
```

## Really Strange orAcle

用各種平方數差的 gcd 去求出 p 應該算是老梗了，難點在於這題連 e 都不知道。推了好久的算式後（結果後來居然有提示...）發現可以用二項式展開的性質藉由詢問 ```pow(1 + p, e, n = p^2)``` 去求出 e。最後要注意的是這題的 n 是 p^2 而非 pq，因此 phi 會變成 p^2-p。

```bash
AIS3{math_go_brrrrr...}
```

## pettan

本次 pre exam 花最多時間做也最有成就感的一題，一開始看到超短的加密方法就覺得躍躍欲試了，雖然最後還是用到了 hint 不過還是學到很多。

根據 Hint 猜測首先要破解的是 python 的 random 函數，利用上網查到的 ```MT19937Recover``` 函數，只要提供前 624 個隨機數字，即可預測接下來的隨機數字。

第一個問題是要怎麼從加密過後的結果得到原本的隨機數呢？方法是一直讓 m 為 0 然後再將得到的結果除以用 1 生成的 padding。接下來的問題是我們得到的隨機數字是 64 bits 但 ```MT19937Recover``` 只支援 32 bits 的數字，研究了 getrandbits 的實作方法後發現其實 64 bits 的數字是直接將兩個 32 bits 組合而成的，照著拆開即可。

到了這邊我們每次 ```pow(m + x, e, n)``` 的 x 就成為確定性的了，只要再多詢問兩次我們就可以藉由 Franklin-reiter 來還原出原本的 m，成功還原出 flag！

```bash
AIS3{bad_padding_and_bad_random_٩(ˊᗜˋ*)و}
```

## shamiko

這是第一次做 Digital Signature Algorithm 相關的題目，因此一開始花了很多時間在研究加密的方法。

看了 hint 說 wikipedia 上面就有寫破解方法後重新讀了幾遍，猜測應該是要利用 k 會碰撞的性質，而 k 基本上是用 ```H(x)``` 生成的，也就是 sha1 函數！印象中這個 hash 函數並不是十分安全，果不其然就找到了 google 幾年前公布的兩份會讓 hash 值碰撞的 pdf。

因為 pdf 轉成 bytes 長度太長因此花了不少時間研究有沒有更小的碰撞字串，最後發現其實這兩份 pdf 只有一小段前綴有差!? 而取出那一小段前綴就能製造碰撞了，於是就利用相同的 k 搭配 wikipedia 上面提供的算法成功還原出 flag～

```bash
AIS3{kiki_kanri!!!_7242d925d0ca45f6ab63b02f388f2b38599f681d}
```