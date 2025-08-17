import pandas as pd

df = pd.read_pickle('swift-style-embeddings.pkl')
pd.set_option('display.max_colwidth', None)

print(df.loc[0:210][['Item Name','Price','Embedding','Encoded Image', 'Image URL']])

print("Noms des colonnes:")
print(df.columns.tolist())
print(f"Dimensions : {df.shape}")
