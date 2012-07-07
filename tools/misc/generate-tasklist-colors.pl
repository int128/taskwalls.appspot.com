#!/usr/bin/perl -w

while(<>) {
	if (/^\[data-tasklistcolor='(\d+)'\].+#(\w)(\w)(\w);/) {
		$i=$1;
		$r=to_background_factor($2);
		$g=to_background_factor($3);
		$b=to_background_factor($4);
		print <<EOB
[data-tasklistcolor='$i'] {
	background: -webkit-linear-gradient(#fff, #$r$g$b);
	background: -moz-linear-gradient(#fff, #$r$g$b);
	background: -o-linear-gradient(#fff, #$r$g$b);
	background: linear-gradient(#fff, #$r$g$b);
}
EOB
	}
}
sub to_background_factor {
	return sprintf('%02x', hex($_[0]) + 235);
}
