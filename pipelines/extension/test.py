import requests
from bs4 import BeautifulSoup

def get_menus():
    dining_halls = {
        "Whitman": 8,
        "Roma": 1,
        "Forbes": 3,
        "Center for Jewish Life": 5,
        "Yeh/NCW": 6
    }
    result = {}
    for dhall, index in dining_halls.items():
        dhall_result = {}
        url = "https://menus.princeton.edu/dining/_Foodpro/online-menu/menuDetails.asp?locationNum={:02d}".format(index)
        text = requests.get(url).text
        soup = BeautifulSoup(text, features="lxml")
        menus = soup.findAll("div", {"class" : "card mealCard"})
        for menu in menus:
            header_div = menu.select_one(".card-header")
            card_header = header_div.find(string=True, recursive=False).strip()

            # 2) Stations -> foods mapping
            stations = {}
            accordion = menu.select_one(".accordion.accordion-flush")

            # Each .mealStation is followed by one or more .accordion-item(s)
            # until the next .mealStation (or the end)
            for station_div in accordion.select("div.mealStation"):
                station_name = station_div.get_text(strip=True)
                foods = []

                # Walk forward through siblings until the next mealStation
                for sib in station_div.find_next_siblings():
                    classes = sib.get("class", [])
                    if "mealStation" in classes:
                        break  # next station reached
                    if "accordion-item" in classes:
                        title_el = sib.select_one(".title")
                        if title_el:
                            foods.append(title_el.get_text(strip=True))

                stations[station_name] = foods

            dhall_result[card_header] = stations

        result[dhall] = dhall_result
    return result

print(get_menus())

# items[0] is something like "Entree"
# subitems is a list, something like ["French Toast", "Scrambled Eggs"]

# orderedData.push({
#         cat: priority[i],
#         items: dhallData[priority[i]].slice(0, 3).join(", "),
#       });