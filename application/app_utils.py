import datetime

# Validate the start date and end date the user chooses to filter by
# and verify that they are in the format, 'YYYY-MM-DD'.
def validate(date_string):
  try:
    datetime.datetime.strptime(date_string, '%Y-%m-%d')
    is_valid_date = True
  except ValueError:
    is_valid_date = False
  return is_valid_date

# Create query filter based on start and end date
def create_date_filter(start_date, end_date):
  query_filter = {}
  # If querying fires on or after a particular date and that date is in the correct format.
  if start_date != None and validate(start_date):
    # If also querying fires on or before a particular date, that date is in the correct format,
    # and the start date is before the end date.
    if end_date != None and validate(end_date) and start_date <= end_date:
      query_filter['acq_date'] = { '$gte' : start_date, '$lte': end_date }
    else:
      query_filter['acq_date'] = { '$gte': start_date }
  return query_filter
