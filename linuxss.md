For those who will search how to connect to Outline Server from Ubuntu 16.04:

1. Get your connection link. It should look like: `ss://ZW5jX3Byb3RvY29sX25hbWU6cHdkCg==@123.123.123.123:1122/?outline=1`

2. Decode your password and server's encryption method name:

$ echo 'ZW5jX3Byb3RvY29sX25hbWU6cHdkCg==' | base64 --decode

3. Install some software:
(To install latest shadowsocks-libev via apt. It's shadowsocks-libev's offical apt repository. See https://github.com/shadowsocks/shadowsocks-libev#install-from-repository)

```
sudo apt-get install software-properties-common -y
sudo add-apt-repository ppa:max-c-lv/shadowsocks-libev -y
sudo apt-get update
sudo apt install shadowsocks-libev
sudo apt-get install polipo
```

4. Start ss-local and polipo. This combination will serve shadowsocks -> socks -> http proxy for you. That's the only way I found to make both browser & terminal to work good.
```
sudo service polipo stop
ss-local -s 123.123.123.123 -p 1122 -k password -b 127.0.0.1 -l 1080 -m encryption_method_name -u &
sudo polipo socksParentProxy=localhost:1080 &
```

5. Set system HTTP proxy as localhost:8123. System -> Network -> Network Proxy -> Manual.

6. Set export http_proxy=http://localhost:8123 in a terminal where you want to use this proxy.
