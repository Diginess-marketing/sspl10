import pandas as pd

try:
    df1 = pd.read_excel(r"C:\Users\ADMIN\Downloads\Net Captured v1 06-05-26.xlsx")
    print("Net Captured columns:", df1.columns.tolist())
    print("Net Captured shape:", df1.shape)
    print("Net Captured head:", df1.head(2).to_dict('records'))
except Exception as e:
    print("Error reading df1:", e)

try:
    df2 = pd.read_excel(r"C:\Users\ADMIN\Downloads\Selection_Format for Trials on 18-07-2026.xlsx")
    print("Selection Format columns:", df2.columns.tolist())
    print("Selection Format shape:", df2.shape)
    print("Selection Format head:", df2.head(2).to_dict('records'))
except Exception as e:
    print("Error reading df2:", e)
