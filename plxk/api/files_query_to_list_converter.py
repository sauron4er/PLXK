from plxk.api.try_except import try_except


def files_query_to_list(files_query):
    files_list = [{
        'id': file.id,
        'file': u'' + file.file.name,
        'name': u'' + file.name,
        'status': 'old'
    } for file in files_query]
    return files_list
