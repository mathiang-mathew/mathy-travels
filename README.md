# Mathy Travels

Mathy Travels is a flight search and booking website for people flying out of Juba, South Sudan. It pulls live flight offers from the Duffel API, lets you sort, filter and search through them, and sends your booking request straight to our team on WhatsApp.

It runs on Python (Flask) and is deployed on two web servers behind a load balancer.

Live site: [https\://www\.mathiangmathew.tech](https://www.mathiangmathew.tech)

Demo video: [https\://youtu.be/kUbnDB77y00](https://youtu.be/kUbnDB77y00)

Repository: [https\://github.com/mathiang-mathew/mathy-travels](https://github.com/mathiang-mathew/mathy-travels)

## Why I built this

Some time ago I wanted to book a flight, and I could not do it online. I had to go to a travel agency office in person just to make the booking. For a lot of people in Juba, that is still how it works: if you want to know the fares or reserve a seat, you go to an office.

Mathy Travels removes that trip. You can search flights from Juba, compare airlines, times and prices, and ask for a booking from home, on your phone or laptop.

Payment was the harder question. There are no proper digital payment options in Juba yet, so a normal online checkout page would not help most travellers. I decided to use WhatsApp for the checkout instead. When you find a flight you like, the "Book on WhatsApp" button opens a chat with Mathy Travels with the flight details already typed in: the airline, flight number, date, times, number of travellers, cabin, price and the offer reference. You send the message, and a support person replies to confirm the seat and the final price and to agree on payment with you.

## What you can do

- Search one-way flights for 1 to 4 adults in economy, premium economy, business or first class. The From box starts with JUB (Juba International Airport).  
- Start typing a city or airport name in the From or To box, such as "nair", and pick the airport from the list. The box fills in its three-letter code for you.  
- Click one of the popular routes from Juba (Nairobi, Entebbe, Addis Ababa or Dubai) to search it straight away. If you have not picked a date, it searches for flights a week from today.  
- Sort the results by cheapest, fastest, earliest departure or latest departure.  
- Show direct flights only, or flights from one airline. The airline list is built from the airlines in your results.  
- Search inside the results by airline name or flight number.  
- Read each flight at a glance: airline and logo, flight number, departure and arrival times, airport codes, total travel time, number of stops, and the total price. A "+1" appears next to the arrival time when the flight lands the next day.  
- Book any flight on WhatsApp with one click.

Times are shown in the local time of each airport, the same way Duffel sends them.

## How to use it

1. Open [https\://www\.mathiangmathew.tech](https://www.mathiangmathew.tech).  
2. Leave From as JUB, or start typing another city or airport name and pick it from the list.  
3. In To, start typing where you want to go, for example "nair" for Nairobi or "addis" for Addis Ababa, and pick the airport from the list. If you already know the three-letter code, such as NBO or DXB, you can type it straight in.  
4. Pick a date (the calendar starts from tomorrow), the number of travellers and the cabin, then press Search flights.  
5. Use the toolbar above the results to sort, filter or search.  
6. Press Book on WhatsApp on the flight you want. WhatsApp opens with your booking message ready. Send it.

You can also skip the form and click any card under "Popular routes from Juba".

## The API: Duffel

All flight data comes from the [Duffel API](https://duffel.com/docs/api). I chose Duffel because it has a free test mode with real flight search, its documentation is clear, and searches from Juba return results.

The app uses two Duffel endpoints:

| Duffel endpoint | What I use it for |
| :---- | :---- |
| `POST https://api.duffel.com/air/offer_requests` | Sends the route, date, passengers and cabin, and gets back the flight offers |
| `GET https://api.duffel.com/places/suggestions?query=` | Finds airports whose name or city matches what the visitor is typing |

Every request carries the token in an `Authorization: Bearer` header and asks for version 2 of the API with `Duffel-Version: v2`.

The browser never talks to Duffel. It calls my own Flask routes, `/api/search` and `/api/airports`. Flask adds the secret token, asks Duffel, and then cuts the answer down. For airport suggestions, it keeps only airports (Duffel also returns cities), up to 8 of them, with just the code, name and city. One search can come back as about 3,700 lines of JSON, most of which the page does not need. The `simplify_offer` function in `app.py` keeps 13 fields for each flight and drops the rest.

I use a Duffel test token. In test mode the results include Duffel Airways (code ZZ), a pretend airline Duffel uses for testing, and the prices are sample data. A test token cannot buy real tickets.

## Built with

- Python 3 and [Flask](https://flask.palletsprojects.com/) for the server and the API routes  
- [requests](https://requests.readthedocs.io/) to call Duffel  
- [python-dotenv](https://github.com/theskumar/python-dotenv) to read the token from a `.env` file  
- [Gunicorn](https://gunicorn.org/) to run Flask on the servers  
- [Nginx](https://nginx.org/) on each web server and [HAProxy](https://www.haproxy.org/) on the load balancer  
- Plain HTML, CSS and JavaScript on the page, with no frameworks

## Project structure

```
app.py                 Flask app: the page, the API routes and the Duffel calls
requirements.txt       Python packages the app needs
.env.example           Example settings file (copy it to .env)
.gitignore             Keeps .env, .venv and cache files out of git
templates/index.html   The page
static/css/style.css   All the styles
static/js/app.js       Search form, airport suggestions, results, sort, filter, search and WhatsApp links
static/images/         Logo, tab icons, hero photo and city photos
```

## Run it on your computer

You need Python 3.8 or newer, git, and a free Duffel account.

1. Clone the repository and open the folder:

```sh
git clone https://github.com/mathiang-mathew/mathy-travels.git
cd mathy-travels
```

2. Create a virtual environment and turn it on:

```sh
python3 -m venv .venv
source .venv/bin/activate
```

   On Windows, use `.venv\Scripts\activate` for the second line.

   

3. Install the packages:

```sh
pip install -r requirements.txt
```

4. Get a Duffel test token. Sign up at [https\://app.duffel.com](https://app.duffel.com), make sure the dashboard is in test mode, then open Developers, then Tokens, and create a token. (For grading, the token I used is in the submission comment.)  
     
5. Copy the example settings file and put your token in it:

```sh
cp .env.example .env
```

   Then open `.env` and replace `my_duffel_test_token` with your token:

```
DUFFEL_TOKEN=your_token_here
PORT=8000
```

6. Start the app:

```sh
python app.py
```

7. Open [http\://localhost:8000](http://localhost:8000) in your browser.

If the terminal prints `Warning: DUFFEL_TOKEN is missing from the .env file`, the `.env` file is missing or the token line is empty. If port 8000 is already in use, change `PORT` in `.env`.

Booking messages go to the WhatsApp number in `WHATSAPP_NUMBER` near the top of `static/js/app.js`. It is written as the country code and number with no plus sign or spaces. Change it if you want the messages to go to a different phone.

## App routes

| Route | What it returns |
| :---- | :---- |
| `/` | The Mathy Travels page |
| `/api/health` | `{"status": "ok"}`. The load balancer uses it to check that each server is working |
| `/api/search` | The flights for a route and date, or an error message |
| `/api/airports` | Up to 8 airports matching the text in `query`, for the From and To suggestions |

`/api/search` takes these values in the address:

| Value | Example | Rules |
| :---- | :---- | :---- |
| `origin` | `JUB` | Required. Airport code |
| `destination` | `NBO` | Required. Airport code |
| `date` | `2026-12-15` | Required. `YYYY-MM-DD` |
| `adults` | `1` | A whole number from 1 to 4\. Defaults to 1 |
| `cabin` | `economy` | `economy`, `premium_economy`, `business` or `first`. Defaults to `economy` |

Example:

```sh
curl "http://localhost:8000/api/search?origin=JUB&destination=NBO&date=2026-12-15&adults=1&cabin=economy"
```

A successful answer looks like this (values shortened):

```json
{
  "flights": [
    {
      "id": "off_0000...",
      "airline": "Duffel Airways",
      "logo": "https://assets.duffel.com/...",
      "price": 412.6,
      "currency": "USD",
      "origin": "JUB",
      "destination": "NBO",
      "departing_at": "2026-12-15T08:30:00",
      "arriving_at": "2026-12-15T10:25:00",
      "stops": 0,
      "duration_minutes": 115,
      "duration_text": "1h 55m",
      "flight_numbers": "ZZ 7341"
    }
  ]
}
```

When something is wrong, the answer is `{"error": "..."}` with a 400 or 503 status code.

`/api/airports` takes one value, `query`, which needs at least 2 characters:

```sh
curl "http://localhost:8000/api/airports?query=nair"
```

```json
{
  "airports": [
    {
      "code": "NBO",
      "name": "Jomo Kenyatta International Airport",
      "city": "Nairobi"
    }
  ]
}
```

If the text is too short or Duffel cannot be reached, it returns an empty list instead of an error, because suggestions are only a help.

## Deployment

The site runs on three servers:

| Server | Job | Address |
| :---- | :---- | :---- |
| 7339-web-01 | Web server 1 (Nginx, Gunicorn, Flask) | 35.179.104.113 |
| 7339-web-02 | Web server 2 (Nginx, Gunicorn, Flask) | 13.40.53.29 |
| 7339-lb-01 | Load balancer (HAProxy) | 13.40.121.81, which [www\.mathiangmathew.tech](http://www.mathiangmathew.tech) points to |

```
                 Visitor
                    |
       https://www.mathiangmathew.tech
                    |
                  lb-01
     HAProxy: HTTPS, round robin, health checks
          /                       \
     web-01                      web-02
     Nginx on port 80            Nginx on port 80
     Gunicorn on 127.0.0.1:8000  Gunicorn on 127.0.0.1:8000
     Flask app                   Flask app
          \                       /
               Duffel API
```

Each web server has its own copy of the app and its own `.env` file. Gunicorn runs the Flask app on port 8000, which only the server itself can reach. Nginx listens on port 80 and passes requests to Gunicorn. HAProxy on lb-01 takes every visitor and sends them to web-01 and web-02 in turns.

### Setting up each web server

I did these steps on web-01 and then repeated them on web-02. Both run Ubuntu 20.04, which comes with Python 3.8.

1. Install what the app needs:

```sh
sudo apt update
sudo apt install -y git python3-venv python3-pip nginx nano
```

2. Get the code and install the packages:

```sh
cd ~
git clone https://github.com/mathiang-mathew/mathy-travels.git
cd mathy-travels
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

3. Create the `.env` file with the Duffel token, and make it readable only by the `ubuntu` user:

```sh
nano .env
chmod 600 .env
```

4. Check that Gunicorn can start the app:

```sh
.venv/bin/gunicorn --bind 127.0.0.1:8000 app:app
```

   In a second terminal, `curl http://127.0.0.1:8000/api/health` should print `{"status":"ok"}`. Stop Gunicorn with Ctrl \+ C.

   

5. Make the app a service, so it starts when the server boots and restarts if it crashes. Create `/etc/systemd/system/mathy-travels.service`:

```
[Unit]
Description=Mathy Travels (Gunicorn)
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/mathy-travels
ExecStart=/home/ubuntu/mathy-travels/.venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

   Then start it:

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now mathy-travels
sudo systemctl status mathy-travels
```

6. Point Nginx at Gunicorn. Create `/etc/nginx/sites-available/mathy-travels`:

```
server {
    listen 80;
    listen [::]:80;
    server_name _;

    add_header X-Served-By $hostname;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

   The `X-Served-By` header tells us which server answered, which is how I test the load balancer.

   

7. Turn the new site on, turn the default site off, and restart Nginx:

```sh
sudo ln -s /etc/nginx/sites-available/mathy-travels /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

8. Test it from the server:

```sh
curl -I http://localhost
```

   The answer should include `X-Served-By: 7339-web-01` (or `7339-web-02`).

### Setting up the load balancer

lb-01 runs HAProxy. The HTTPS certificate for [www\.mathiangmathew.tech](http://www.mathiangmathew.tech) was already on this server from an earlier project, so HAProxy reuses it. I added this to `/etc/haproxy/haproxy.cfg`:

```
frontend http_front
    bind *:80
    bind *:443 ssl crt /etc/haproxy/certs/www.mathiangmathew.tech.pem
    http-request redirect scheme https unless { ssl_fc }
    default_backend http_back

backend http_back
    balance roundrobin
    option httpchk GET /api/health
    server web-01 35.179.104.113:80 check
    server web-02 13.40.53.29:80 check
```

Visitors who come in on plain HTTP are sent to HTTPS. `balance roundrobin` sends requests to web-01 and web-02 in turns. `option httpchk GET /api/health` makes HAProxy call the health route on each server every few seconds. That request goes through Nginx and Gunicorn to Flask, so a server is only used while the whole app on it is working.

Check the file and restart HAProxy:

```sh
sudo haproxy -c -f /etc/haproxy/haproxy.cfg
sudo systemctl restart haproxy
```

### Testing the load balancer

Ask the site several times and look at which server answered:

```sh
for i in 1 2 3 4 5 6; do curl -sI https://www.mathiangmathew.tech | grep -i x-served-by; done
```

The answers take turns:

```
x-served-by: 7339-web-01
x-served-by: 7339-web-02
x-served-by: 7339-web-01
x-served-by: 7339-web-02
...
```

I also tested what happens when one server fails. I stopped the app on web-02 with `sudo systemctl stop mathy-travels` and ran the loop again. Every answer came from web-01 and the site kept working. After `sudo systemctl start mathy-travels`, web-02 came back into the rotation on its own.

### Updating the live site

After pushing changes to GitHub, I run this on both web servers:

```sh
cd ~/mathy-travels && git pull && sudo systemctl restart mathy-travels
```

## Keeping the API key safe

- The Duffel token lives in a `.env` file. `.gitignore` lists `.env`, so the real token has never been committed. The repository only has `.env.example`, which holds a fake value.  
- On the servers, `.env` is readable only by the `ubuntu` user (`chmod 600`).  
- Only the server talks to Duffel. The token never reaches the browser, and you will not find it in the page source or in the Network tab of the browser's developer tools.  
- The token is a test token, so it cannot buy real tickets or spend money.  
- For grading, the token is shared in the submission comment and nowhere in this repository.

Other protections:

- The server checks every search before calling Duffel. Airport codes are trimmed and made uppercase, travellers must be a whole number from 1 to 4, the cabin must be one of the four allowed values, and route and date are required.  
- Flight cards are built from an HTML `<template>`, and every value from the API is added with `textContent`. Text coming back from Duffel is never treated as HTML, so it cannot run as code on the page.  
- The WhatsApp message is encoded with `encodeURIComponent`, and the WhatsApp link opens in a new tab with `rel="noopener"`.  
- The site is served over HTTPS, and plain HTTP is redirected.  
- The date box does not allow dates before tomorrow.

## Error handling

| What happens | What the visitor sees |
| :---- | :---- |
| Route or date missing | "Choose where you are flying from, where to, and a date." (the browser also stops empty required fields) |
| Travellers outside 1 to 4 | "Choose between 1 and 4 travellers." |
| A cabin that is not allowed | "Choose economy, premium economy, business or first" |
| Duffel rejects the search, for example an airport code that does not exist | Duffel's own explanation of the problem |
| Duffel cannot be reached or takes longer than 30 seconds | "We could not reach the airline system. Try again in a minute." |
| The visitor's internet drops, or our server cannot be reached | "We could not connect. Check your internet connection and try again." |
| No flights on that route and date | "No flights found for this route and date. Try another date." |
| The filters hide every flight | "No flights match these filters. Try clearing the search or choosing any number of stops." |
| Airport suggestions cannot load | No list appears, and the visitor can still type the airport code |
| An airline has no logo | The card shows the airline name without an empty image |
| One web server goes down | HAProxy sends every visitor to the other server |

While a search is running, the button changes to "Searching..." and cannot be pressed again, so one click sends one request. The results message uses `role="status"`, so screen readers announce it.

## Speed

- Sorting, filtering and searching happen in the browser on the flights that already arrived. Changing them never calls Duffel again.  
- The server sends the browser 13 fields per flight instead of Duffel's full answer.  
- The From and To boxes wait until the visitor stops typing for 300 milliseconds before asking for suggestions, so typing "nairobi" does not send a request for every letter.  
- The server remembers airport answers it has already got (`airport_cache` in `app.py`), so the same text does not go to Duffel twice.  
- Every Duffel request has a timeout, so a slow answer cannot hold a Gunicorn worker forever.  
- Each web server runs 3 Gunicorn workers, so one slow search does not block other visitors.  
- The city photos load only when you scroll near them (`loading="lazy"`).

## Challenges and how I solved them

Different Python versions. My Mac has Python 3.14, and the servers run Ubuntu 20.04 with Python 3.8. The newest versions of some packages do not install on Python 3.8. I changed `requirements.txt` from exact versions to minimum versions (for example `flask>=3.0`), so pip picks the newest version that works on each machine.

Two virtual environments. I created a `venv` folder while VS Code created its own `.venv`, and packages ended up in the wrong one. I kept `.venv`, deleted the other and added `.venv/` to `.gitignore`.

Duffel's answer is huge. One search returned about 3,700 lines of JSON, full of details the page does not need. I wrote `simplify_offer` to pick out the 13 fields the cards use. It also keeps internal values out of the browser.

Strange duration format. Duffel writes travel time as codes like `PT6H25M` (6 hours 25 minutes) or `P1DT1H40M` (1 day, 1 hour and 40 minutes). I wrote `duration_in_minutes`, which reads the code one character at a time and adds up the days, hours and minutes. Having the duration as a number also makes "Fastest first" sorting simple.

Overnight flights looked wrong. A flight leaving at 22:00 and landing at 06:00 looked like it arrived before it left. The card now compares the departure and arrival dates and adds "+1" (or more) to the arrival time.

One slash broke everything. I typed `/` instead of `//` for the comment on the first line of `app.js`. The whole script stopped running and nothing on the page responded. The browser console pointed me to line 1\.

Suggestions that failed in silence. For a while the airport list never appeared, and the console showed no errors. The cause was two typos inside the `try` block of `loadAirportSuggestions`: `createElemenet` instead of `createElement`, and `airports.code` instead of `airport.code`. The `catch` is empty on purpose, so a failed suggestion never stops a search, and that also hid both mistakes. The To box was missing its `<datalist>` as well. Fixing those three things made the list appear.

Nginx kept the old settings on web-02. `nginx reload` did not pick up my new site file, but `systemctl restart nginx` did. On the same server I had also typed the Nginx settings into the systemd service file by mistake, so I deleted it and created both files again.

A health check that stops at Nginx can miss a broken app, because Nginx keeps running even when Gunicorn has stopped. I added the `/api/health` route so HAProxy's check passes through Nginx and Gunicorn to Flask. When I stopped the app on web-02, HAProxy took it out of the rotation.

Half-updated servers. After one update, the live page sometimes loaded without its styles. web-01 had the new code and web-02 still had the old code, and the load balancer was switching between them. I now update both servers before testing through the load balancer.

Small things on the servers. Ubuntu on web-02 and lb-01 did not have `nano`, so I installed it. My browser also kept an old copy of `app.js`, and turning on "Disable cache" in the Network tab of the developer tools fixed that.

## Limitations and what I would add next

- Searches are one way only. Return trips are next.  
- Bookings are for 1 to 4 adults. Children and infants would need more passenger options.  
- The layout is made for laptops and desktops. A phone layout is the next design job.  
- Prices come from Duffel's test mode. A live token would show real fares.  
- Payment is arranged by hand on WhatsApp. Once a reliable digital payment option exists in South Sudan, I would add it to the checkout.

## Credits

- Flight data: [Duffel API](https://duffel.com/docs/api)  
- Server and tools: [Flask](https://flask.palletsprojects.com/), [requests](https://requests.readthedocs.io/), [python-dotenv](https://github.com/theskumar/python-dotenv), [Gunicorn](https://gunicorn.org/), [Nginx](https://nginx.org/) and [HAProxy](https://www.haproxy.org/)  
- Font: [Figtree](https://fonts.google.com/specimen/Figtree) by Erik Kennedy, from Google Fonts, under the SIL Open Font License  
- Icons: [Material Symbols](https://fonts.google.com/icons) by Google, under the Apache License 2.0  
- Photos: the city photos on the popular route cards are from Unsplash, and the hero photo shows Juba International Airport  
- Layout and colours inspired by the FlyScope flight booking design  
- Mathy Travels logo: designed by me

## Use of AI

I used Claude (Anthropic) as a tutor and code reviewer during this project.

- I typed the Python, HTML, CSS and JavaScript myself.  
- When something broke, I pasted the error or my code, and Claude pointed me to the line and the mistake so I could fix it.  
- Claude walked me through the server, Nginx, systemd and HAProxy setup, and I ran each command on the servers myself.  
- Claude drafted this README from my notes and my story, and I reviewed and edited it.

All commits were made by me.

## Submission notes

- The Duffel test token is in the submission comment. Put it in `.env` as shown in "Run it on your computer".  
- The site does not need a login.

## Author

Mathiang Mathew, Software Engineering student at African Leadership University. GitHub: [mathiang-mathew](https://github.com/mathiang-mathew)