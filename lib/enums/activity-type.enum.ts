export enum ActivityType {
  /**
   * Order fills (both partial and full fills)
   */
  Fill = 'FILL',
  /**
   * Cash transactions (both CSD and CSR)
   */
  Transaction = 'TRANS',
  /**
   * Miscellaneous or rarely used activity types (All types except those in TRANS, DIV, or FILL)
   */
  Misc = 'MISC',
  /**
   * ACATS IN/OUT (Cash)
   */
  AcatsCash = 'ACATC',
  /**
   * ACATS IN/OUT (Securities)
   */
  AcatsSecurities = 'ACATS',
  /**
   * Cash disbursement(+)
   */
  CashDisbursement = 'CSD',
  /**
   *  Cash receipt(-)
   */
  CashReceipt = 'CSR',
  /**
   * Dividends
   */
  Dividends = 'DIV',
  /**
   * Dividend (capital gain long term)
   */
  DividenCapitalGainLongTerm = 'DIVCGL',
  /**
   * Dividend (capital gain short term)
   */
  DividenCapitalGainShortTerm = 'DIVCGS',
  /**
   * Dividend fee
   */
  DividendFee = 'DIVFEE',
  /**
   * Dividend adjusted (Foreign Tax Withheld)
   */
  DividendAdjustedForeign = 'DIVFT',
  /**
   * Dividend adjusted (NRA Withheld)
   */
  DividendAdjustedNRA = 'DIVNRA',
  /**
   * Dividend return of capital
   */
  DividenReturnOfCapital = 'DIVROC',
  /**
   * Dividend adjusted (Tefra Withheld)
   */
  DividendAdjustedTefra = 'DIVTW',
  /**
   *  Dividend (tax exempt)
   */
  DividendTaxExempt = 'DIVTXEX',
  /**
   * Interest (credit/margin)
   */
  Interest = 'INT',
  /**
   *  Interest adjusted (NRA Withheld)
   */
  InterestAdjustedNRA = 'INTNRA',
  /**
   * Interest adjusted (Tefra Withheld)
   */
  InterestAdjustedTefra = 'INTTW',
  /**
   * Journal entry
   */
  JournalEntry = 'JNL',
  /**
   * Journal entry (cash)
   */
  JournalEntryCash = 'JNLC',
  /**
   * Journal entry (stock)
   */
  JournalEntryStock = 'JNLS',
  /**
   * Merger/Acquisition
   */
  MergerAcquisition = 'MA',
  /**
   * Name change
   */
  NameChange = 'NC',
  /**
   * Option assignment
   */
  OptionAssignment = 'OPASN',
  /**
   * Option expiration
   */
  OptionExpiration = 'OPEXP',
  /**
   * Option exercise
   */
  OptionExercise = 'OPXRC',
  /**
   * Pass Thru Charge
   */
  PassThruCharge = 'PTC',
  /**
   * Pass Thru Rebate
   */
  PassThruRebate = 'PTR',
  /**
   * Reorg CA
   */
  Reorg = 'REORG',
  /**
   * Symbol change
   */
  SymbolChange = 'SC',
  /**
   * Stock spinoff
   */
  SotckSpinoff = 'SSO',
  /**
   * Stock split
   */
  StockSplit = 'SSP',
}
