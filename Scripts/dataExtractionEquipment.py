import pandas as pd
import json

def getSheetNames():
    return [
        "Armurerie",
        "Balistique",
        "Bioingénierie",
        "Biotechnologie",
        "Cybernétique",
        "Ingénierie Spécialisée",
        "Matériaux",
        "Mécatronique",
        "Pharmacologie",
        "Programmation",
        "Protection Matérielle",
        "Robotique"
    ]

class JsonItem:
    def __init__(self):
        self.name = "" # Nom
        self.prerequisites = "" # Pré-Requis
        self.descriptions = "" # Description & Effet
        self.marketPrice = "" # Prix du marché
        self.costToCraftInCredit = "" # Fabrication : Crédits
        self.ressourcesNeeded = "" # Fabrication : Ressources
        self.craftTimeInMinutes = "" # Temps (minutes)
        self.craftTimeInDowntime = "" # Temps (downtime)
        self.maxPerDowntime = "" # Max par downtime
        self.location = "" # Emplacement
        self.malfunction = "" # Malfunction
        self.salary = "" # Salaire
        self.propDescription = "" # Identification
        self.skillNeeded = "" # Compétence

    def to_dict(self):
        return {
            "name": self.name,
            "prerequisites": self.prerequisites,
            "descriptions": self.descriptions,
            "marketPrice": self.marketPrice,
            "costToCraftInCredit": self.costToCraftInCredit,
            "ressourcesNeeded": self.ressourcesNeeded,
            "craftTimeInMinutes": self.craftTimeInMinutes,
            "craftTimeInDowntime": self.craftTimeInDowntime,
            "maxPerDowntime": self.maxPerDowntime,
            "location": self.location,
            "malfunction": self.malfunction,
            "salary": self.salary,
            "propDescription": self.propDescription,
            "skillNeeded": self.skillNeeded
        }

def getDataFrame():
    return pd.read_excel('equipement.xlsx', sheet_name=getSheetNames())

def extractJsonItems(dataFrames):
    items = []
    column_mapping = {
        'Nom': 'name',
        'Pré-Requis': 'prerequisites',
        'Description & Effet': 'descriptions',
        'Prix du marché': 'marketPrice',
        'Fabrication : Crédits': 'costToCraftInCredit',
        'Fabrication : Ressources': 'ressourcesNeeded',
        'Temps (minutes)': 'craftTimeInMinutes',
        'Temps (downtime)': 'craftTimeInDowntime',
        'Max par downtime': 'maxPerDowntime',
        'Emplacement': 'location',
        'Malfunction': 'malfunction',
        'Salaire': 'salary',
        'Identification': 'propDescription',
        'Compétence': 'skillNeeded'
    }
    
    for sheet_name, df in dataFrames.items():
        if df.empty:
            continue
            
        for _, row in df.iterrows():
            item = JsonItem()
            
            for fr_column, attr_name in column_mapping.items():
                if fr_column in df.columns:
                    value = row[fr_column]
                    if pd.isna(value):
                        value = ""
                    elif isinstance(value, (int, float)):
                        value = str(value)
                    elif value == '-':
                        value = ""
                    value = value.strip()
                    setattr(item, attr_name, value)
            
            item_dict = item.to_dict()
            item_dict['category'] = sheet_name
            items.append(item_dict)
    
    return json.dumps(items, ensure_ascii=False, indent=2)

def main():
    df = getDataFrame()
    json_string = extractJsonItems(df)
    
    with open('equipment.json', 'w', encoding='utf-8') as f:
        f.write(json_string)

if __name__ == "__main__":
    main()