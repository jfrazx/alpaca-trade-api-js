import { DayTradeMarginCallChecks, TradeConfirmationEmails } from '../types';

export interface AccountConfiguration {
  dtbp_check: DayTradeMarginCallChecks;
  trade_confirm_email: TradeConfirmationEmails;
  suspend_trade: boolean;
  no_shorting: boolean;
}
