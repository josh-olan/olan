from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("register", views.register, name="register"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("myaccounts/<str:validate>", views.myaccounts, name="myaccounts"),
    path("addaccount", views.add_account, name="addaccount"),

    # API routes
    path("confirm/<str:username>", views.confirm),
    path("get_user", views.get_user),
    path("change_password", views.change_password),
    path("checkaccounts", views.checkaccounts),
    path("transfer_between_accounts", views.transfer_between_accounts),
    path("update_balances/<str:account_type>", views.update_balances),
    path("transfer_external_account", views.transfer_external_account),
    path("get_transactions/<str:account_type>/<int:index>", views.get_transactions),
    path("deposit", views.deposit),
    path("withdraw", views.withdraw),
    path("place_trade", views.place_trade),
    path("sell", views.sell),
    path("get_trades/<str:state>/<int:index>", views.get_trades),
    path("get_watchlist_stocks", views.get_watchlist_stocks),
    path("modify_watchlist/<str:action>", views.modify_watchlist)
]