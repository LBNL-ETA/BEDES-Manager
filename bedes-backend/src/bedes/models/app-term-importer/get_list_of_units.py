import pandas as pd

# bedes_terms = 'BEDES_all-terms_Version 2.3.csv'
directory = '/Users/pranavhgupta/Documents/GitHub/BEDES-Manager/bedes-mappings/'
bedes_term_list_options = 'BEDES_all_list_options_Version 2.3.csv'
result = []

raw_df = pd.read_csv(directory + bedes_term_list_options)
df = raw_df.loc[raw_df['Related-Term'] == 'Unit Of Measure', 'List-Option']
df.loc[len(df)] = 'n/a'
df = df.reset_index()
df = df.drop(columns=['index'])

for index, row in df.iterrows():
    query = 'insert into unit(id, name) values(' + str(index) + ',\'' + row['List-Option'] + '\');'
    print(query)